import { NextRequest } from "next/server";
import { getChatStream } from "@/lib/ai";

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatUserContext = {
  homeCountry: string;
  targetCountry: string;
  category: string;
};

// NOTE: In-memory rate limiting works for single-instance deploys (local dev,
// Railway, single Render instance). On Vercel serverless or multi-instance
// hosting, each instance has its own counter so effective limit is
// 20 × instances. Upgrade to Upstash Redis when moving to production
// multi-instance hosting. See Task 6 for the upgrade path.
const requestCounts = new Map<string, number>();
const rateLimitTimer = setInterval(
  () => requestCounts.clear(),
  RATE_WINDOW_MS,
);
if (typeof rateLimitTimer.unref === "function") {
  rateLimitTimer.unref();
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isChatMessage(v: unknown): v is ChatMessage {
  if (!v || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  return (
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string"
  );
}

function trimOldestPairs(messages: ChatMessage[], max: number): ChatMessage[] {
  let trimmed = messages;
  while (trimmed.length > max) {
    trimmed = trimmed.slice(2);
  }
  return trimmed;
}

// Gemini requires strictly alternating user/model turns and the history must
// start with 'user'. The last message in `messages` is the current user prompt
// and is preserved untouched — only the prior history is sanitized.
function sanitizeForGemini(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length === 0) return messages;

  const current = messages[messages.length - 1];
  const history = messages.slice(0, -1);

  // Collapse runs of same-role messages — keep the latest in each run.
  const collapsed: ChatMessage[] = [];
  for (const m of history) {
    const last = collapsed[collapsed.length - 1];
    if (last && last.role === m.role) {
      collapsed[collapsed.length - 1] = m;
    } else {
      collapsed.push(m);
    }
  }

  // History must start with 'user'.
  while (collapsed.length > 0 && collapsed[0].role !== "user") {
    collapsed.shift();
  }

  // History must end with 'assistant' so the next turn (current user) alternates.
  while (
    collapsed.length > 0 &&
    collapsed[collapsed.length - 1].role !== "assistant"
  ) {
    collapsed.pop();
  }

  return [...collapsed, current];
}

function parseUserContext(value: unknown): ChatUserContext | undefined {
  if (!value || typeof value !== "object") return undefined;
  const c = value as Record<string, unknown>;
  if (
    typeof c.homeCountry === "string" &&
    typeof c.targetCountry === "string" &&
    typeof c.category === "string" &&
    c.homeCountry.length > 0 &&
    c.targetCountry.length > 0 &&
    c.category.length > 0
  ) {
    return {
      homeCountry: c.homeCountry,
      targetCountry: c.targetCountry,
      category: c.category,
    };
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  // Rate limit first — fail fast on abusive clients before any parsing work.
  const ip = getClientIp(req);
  const next = (requestCounts.get(ip) ?? 0) + 1;
  requestCounts.set(ip, next);
  if (next > RATE_LIMIT) {
    return jsonError(
      "Too many requests. Please wait a moment before asking again.",
      429,
    );
  }

  // Parse body.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Messages are required", 400);
  }
  const { messages, userContext } = (body ?? {}) as {
    messages?: unknown;
    userContext?: unknown;
  };

  // Validate messages shape.
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.every(isChatMessage)
  ) {
    return jsonError("Messages are required", 400);
  }
  const typed = messages as ChatMessage[];

  // Validate per-message length.
  for (const m of typed) {
    if (m.content.length > MAX_MESSAGE_LENGTH) {
      return jsonError("Message too long", 400);
    }
  }

  // Last message must be from the user.
  if (typed[typed.length - 1].role !== "user") {
    return jsonError("Last message must be from user", 400);
  }

  // Trim oldest pairs if over the cap, then sanitize alternation.
  const trimmed = trimOldestPairs(typed, MAX_MESSAGES);
  const sanitized = sanitizeForGemini(trimmed);
  const context = parseUserContext(userContext);

  // Call Gemini with streaming.
  let streamResult: Awaited<ReturnType<typeof getChatStream>>;
  try {
    streamResult = await getChatStream(sanitized, context);
  } catch (error) {
    console.error("[/api/chat] Gemini request failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("User location is not supported")) {
      return jsonError(
        "AI service is not available in this region. Please contact support.",
        503,
      );
    }
    return jsonError("AI service unavailable. Please try again.", 500);
  }

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        console.error("[/api/chat] Stream interrupted:", error);
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
