import "server-only";

const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3.6-flash";

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

const MODEL_SEQUENCE = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

export class GeminiService {
  private currentModelIndex = 0;
  private models: string[];

  constructor(primaryModel?: string) {
    const configured = primaryModel || process.env.GEMINI_MODEL || DEFAULT_MODEL;
    this.models = Array.from(new Set([configured, ...MODEL_SEQUENCE]));
  }

  public get model(): string {
    return this.models[this.currentModelIndex] || DEFAULT_MODEL;
  }

  public async switchModel(): Promise<void> {
    const from = this.model;
    if (this.currentModelIndex + 1 < this.models.length) {
      this.currentModelIndex++;
      console.warn(`Quota/limit on ${from} → falling back to ${this.model}`);
    } else {
      console.warn(
        `Quota exhausted on all ${this.models.length} models — cooling down 10s before retrying ${this.models[0]}`
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
      this.currentModelIndex = 0;
    }
  }

  public async generateContent(
    messages: ChatMessage[],
    responseJsonSchema?: GeminiSchema,
    userApiKey?: string,
    retryCount = 0
  ): Promise<string> {
    const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please provide your own API key to continue.");
    }

    if (retryCount >= this.models.length * 2) {
      throw new Error("All available Gemini models reached API limits or quota errors.");
    }

    const systemInstruction = messages.find((m) => m.role === "system")?.content;
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => {
        const parts: Array<
          | { text: string }
          | { inlineData: { mimeType: string; data: string } }
        > = [{ text: m.content }];
        if (m.images?.length) {
          for (const img of m.images) {
            parts.push({ inlineData: { mimeType: img.mime, data: img.base64 } });
          }
        }
        return {
          role: m.role === "assistant" ? "model" : "user",
          parts,
        };
      });

    try {
      const activeModel = this.model;
      const res = await fetch(
        `${GEMINI_API_ROOT}/${encodeURIComponent(activeModel)}:generateContent`,
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
        if (
          res.status === 429 ||
          res.status === 404 ||
          message.toLowerCase().includes("quota") ||
          message.toLowerCase().includes("not found") ||
          message.toLowerCase().includes("limit")
        ) {
          await this.switchModel();
          return this.generateContent(messages, responseJsonSchema, userApiKey, retryCount + 1);
        }
        throw new Error(`Gemini (${activeModel}) ${res.status}: ${message}`);
      }

      const content = json?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

      if (!content) {
        const blockReason = json?.promptFeedback?.blockReason;
        const finishReason = json?.candidates?.[0]?.finishReason;
        throw new Error(
          `Gemini (${activeModel}) returned no content${
            blockReason ? ` (${blockReason})` : finishReason ? ` (${finishReason})` : ""
          }`
        );
      }

      return content;
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : String(ex);
      if (
        msg.includes("429") ||
        msg.includes("404") ||
        msg.toLowerCase().includes("quota") ||
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("limit")
      ) {
        await this.switchModel();
        return this.generateContent(messages, responseJsonSchema, userApiKey, retryCount + 1);
      }
      throw ex;
    }
  }
}

const serviceInstance = new GeminiService();

export async function callGemini(
  messages: ChatMessage[],
  responseJsonSchema?: GeminiSchema,
  userApiKey?: string
): Promise<string> {
  return serviceInstance.generateContent(messages, responseJsonSchema, userApiKey);
}
