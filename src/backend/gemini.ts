import "server-only";

const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

export type ChatImage = {
  mime: string;
  base64: string;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  images?: ChatImage[];
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
  responseJsonSchema?: GeminiSchema,
  userApiKey?: string
): Promise<string> {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please provide your own API key to continue."
    );
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const systemInstruction = messages.find((message) => message.role === "system")?.content;
  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => {
      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [{ text: message.content }];
      if (message.images?.length) {
        for (const img of message.images) {
          parts.push({ inlineData: { mimeType: img.mime, data: img.base64 } });
        }
      }
      return {
        role: message.role === "assistant" ? "model" : "user",
        parts,
      };
    });

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
