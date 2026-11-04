import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// ── MODEL CONFIG ─────────────────────────────

// Use Flash for chat (fast + cheap)
// Use Pro for readiness scoring (more reasoning)
export const CHAT_MODEL = "gemini-2.5-flash";
export const SCORE_MODEL = "gemini-2.5-pro";

// ── SYSTEM PROMPTS ───────────────────────────

export const COMPANION_SYSTEM_PROMPT = `
You are the My Caribbean Companion AI assistant —
a warm, knowledgeable guide helping CARICOM citizens
understand how to legally relocate for work under
the CSME Free Movement of Skills framework.

Your personality:
- Warm and encouraging — like a friend who has
  already made this move successfully
- Clear and jargon-free — explain legal terms
  in plain language
- Honest about uncertainty — if you are not 100%
  sure about a specific rule, say so and direct
  the user to the official competent authority
- Never fabricate specific deadlines, fees,
  or processing times — these change frequently

What you know well:
- CSME Free Movement of Skills framework
- The 12 approved professional categories
- Skills Certificate application process
- General immigration steps for CARICOM countries
- What documents are typically required
- The role of Competent Authorities

What you always say when unsure:
"I recommend confirming this directly with the
Competent Authority in [country] as requirements
can change."

What you never do:
- Provide specific legal advice on disputes
- Guarantee approval or timelines
- Make up government URLs or form numbers
- Discuss immigration outside CARICOM/CSME context

How you format answers (shown in a small chat window):
- Answer the question in the first sentence — no
  long greeting or "What a wonderful choice!" opener
- Keep answers under about 200 words unless the
  user asks for more detail
- Use short paragraphs (2–3 sentences)
- Use a bulleted or numbered list only for 3+
  parallel items, with at most 5 items
- Bold only key terms or figures, not whole sentences
- Use "###" for a heading only when an answer has
  distinct sections; never use larger headings
- No tables, code blocks or emojis
- End with one short, practical next step when useful
`;

export const SCORE_SYSTEM_PROMPT = `
You are a CSME relocation readiness analyst.
Assess how prepared a CARICOM citizen is to
relocate for work and return a structured
JSON readiness report.

Always respond with valid JSON only —
no preamble, no markdown, no explanation
outside the JSON structure.
`;

// ── TYPES ─────────────────────────────────────

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatUserContext = {
  homeCountry?: string;
  targetCountry?: string;
  category?: string;
};

// ── API FUNCTIONS ─────────────────────────────

export async function getReadinessAnalysis(
  profileData: Record<string, unknown>,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: SCORE_MODEL,
    systemInstruction: SCORE_SYSTEM_PROMPT,
  });

  const result = await model.generateContent(
    `Analyze this CSME relocation profile and return
    a readiness report: ${JSON.stringify(profileData)}`,
  );
  return result.response.text();
}

export async function extractJSON(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    systemInstruction:
      "Respond with valid JSON only. " +
      "No markdown, no code blocks, no explanation. " +
      "Output must be parseable by JSON.parse().",
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/** Run extractJSON and parse the result, tolerating stray ```json fences. */
export async function extractJSONObject<T = Record<string, unknown>>(
  prompt: string,
): Promise<T> {
  const raw = await extractJSON(prompt);
  return JSON.parse(raw.replace(/```json|```/g, "").trim()) as T;
}

// ── STREAMING ─────────────────────────────────

export async function getChatStream(
  messages: ChatMessage[],
  userContext?: ChatUserContext,
) {
  const contextNote = userContext
    ? `\n\nUser context: Moving from ${userContext.homeCountry}
       to ${userContext.targetCountry}
       as a ${userContext.category}.`
    : "";

  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    systemInstruction: COMPANION_SYSTEM_PROMPT + contextNote,
  });

  // Gemini uses 'model' instead of 'assistant'
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  return chat.sendMessageStream(messages[messages.length - 1].content);
}
