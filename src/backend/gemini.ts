import "server-only";

const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.0-flash";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GeminiSchema = Record<string, unknown>;

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    finishReason?: string;
  }[];
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    message?: string;
  };
};

export async function callGemini(
  messages: ChatMessage[],
  responseJsonSchema?: GeminiSchema
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Copy .env.local.example to .env.local and fill it in."
    );
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const systemInstruction = messages.find((message) => message.role === "system")?.content;
  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  const res = await fetch(
    `${GEMINI_API_ROOT}/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: systemInstruction
          ? { parts: [{ text: systemInstruction }] }
          : undefined,
        contents,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseJsonSchema,
        },
      }),
    }
  );

  const json = (await res.json().catch(() => null)) as GeminiResponse | null;
  if (!res.ok) {
    const message = json?.error?.message || res.statusText;
    throw new Error(`Gemini ${res.status}: ${message}`);
  }

  const content = json?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!content) {
    const blockReason = json?.promptFeedback?.blockReason;
    const finishReason = json?.candidates?.[0]?.finishReason;
    throw new Error(
      `Gemini returned no content${blockReason ? ` (${blockReason})` : finishReason ? ` (${finishReason})` : ""}`
    );
  }

  return content;
}
