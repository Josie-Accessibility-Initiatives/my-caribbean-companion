import { NextRequest } from "next/server";
import { getChatStream, type ChatMessage, type ChatUserContext } from "@/lib/ai";
import { getSignedInUserId } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import {
  CHAT_DAILY_LIMIT,
  CHAT_REMAINING_HEADER,
  MAX_MESSAGE_LENGTH,
  remainingToday,
  type ChatUsage,
} from "@/lib/chat-limits";
import { apiError } from "@/lib/api";

const MAX_MESSAGES = 50;
/** Earlier turns (often long AI answers) are clipped to this, not rejected. */
const MAX_HISTORY_MESSAGE_LENGTH = 4000;

/** 401 for guests — the widget shows a sign-in prompt for code "auth_required". */
function authRequired() {
  return apiError("Sign in to use the AI Companion.", 401, "auth_required");
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

function parseUserContext(value: unknown): Required<ChatUserContext> | undefined {
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

/** Map a Gemini failure to a user-facing message (credits, rate limits, region). */
function geminiErrorResponse(error: unknown): Response {
  const status =
    error && typeof error === "object" && "status" in error ? Number(error.status) : 0;
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("User location is not supported")) {
    return apiError("AI service is not available in this region. Please contact support.", 503);
  }
  if (status === 402 || status === 429) {
    // 402: prepaid credits depleted · 429: Gemini quota/rate limit
    return apiError(
      "The AI Companion is temporarily unavailable. Please try again later.",
      503,
      "ai_unavailable"
    );
  }
  return apiError("AI service unavailable. Please try again.", 500);
}

/** GET /api/chat — today's usage for the signed-in user. */
export async function GET() {
  const userId = await getSignedInUserId();
  if (!userId) return authRequired();

  const today = new Date().toISOString().slice(0, 10); // UTC, matches the database
  const { data, error } = await adminClient
    .from("chat_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("day", today)
    .maybeSingle();
  if (error) {
    console.error("[/api/chat] usage lookup failed:", error);
    return apiError("Could not load your chat usage.", 500);
  }

  const usage: ChatUsage = { remaining: remainingToday(data?.message_count ?? 0) };
  return Response.json(usage);
}

/** POST /api/chat — stream a Gemini reply. Signed-in users only, capped per day. */
export async function POST(req: NextRequest) {
  const userId = await getSignedInUserId();
  if (!userId) return authRequired();

  // Validate the request before using up one of the user's daily messages.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Messages are required", 400);
  }
  const { messages, userContext } = (body ?? {}) as {
    messages?: unknown;
    userContext?: unknown;
  };

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.every(isChatMessage)
  ) {
    return apiError("Messages are required", 400);
  }
  const typed = messages as ChatMessage[];
  const current = typed[typed.length - 1];

  if (current.role !== "user") {
    return apiError("Last message must be from user", 400);
  }
  // Only the new question is limited; history includes long AI replies.
  if (current.content.length > MAX_MESSAGE_LENGTH) {
    return apiError(
      `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
      400
    );
  }
  const history = typed.slice(0, -1).map((m) => ({
    ...m,
    content: m.content.slice(0, MAX_HISTORY_MESSAGE_LENGTH),
  }));

  // Claim one of today's messages (atomic; null means the cap is reached).
  const { data: usedToday, error: claimError } = await adminClient.rpc("claim_chat_message", {
    p_user_id: userId,
    p_limit: CHAT_DAILY_LIMIT,
  });
  if (claimError) {
    console.error("[/api/chat] usage claim failed:", claimError);
    return apiError("AI service unavailable. Please try again.", 500);
  }
  if (usedToday === null) {
    return apiError(
      `You've used all ${CHAT_DAILY_LIMIT} AI Companion messages for today. Your limit resets at midnight UTC.`,
      429,
      "daily_limit_reached"
    );
  }

  const sanitized = sanitizeForGemini(trimOldestPairs([...history, current], MAX_MESSAGES));
  const context = parseUserContext(userContext);

  let streamResult: Awaited<ReturnType<typeof getChatStream>>;
  try {
    streamResult = await getChatStream(sanitized, context);
  } catch (error) {
    console.error("[/api/chat] Gemini request failed:", error);
    // The user got no answer, so don't count this message against them.
    await adminClient.rpc("refund_chat_message", { p_user_id: userId });
    return geminiErrorResponse(error);
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
      [CHAT_REMAINING_HEADER]: String(remainingToday(usedToday as number)),
    },
  });
}
