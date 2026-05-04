import "server-only";
import { ReportDataSchema, type ReportData } from "@/types/report";
import { callGemini, type ChatMessage } from "@/backend/gemini";

const SYSTEM_PROMPT = `You are a formal academic report writer for the AI & ML Club at Dhole Patil College of Engineering. Convert the user's messy notes into a structured event report.

Tone: formal, third person, past tense, no marketing fluff, no emojis, Indian English spelling. Do not invent facts that are not implied by the input. If a detail is missing, write generally rather than fabricating specifics.

Return ONLY a JSON object matching this schema. No prose, no markdown, no code fences.

{
  "overview": string,                        // 60-120 words: what happened, why, who organised it
  "programDetails": {
    "description": string,                   // 60-120 words: narrative of session flow
    "bullets": string[]                      // 4-8 concise points: topics, demos, tools, presenters
  },
  "outcome": string                          // 50-100 words: skills gained, takeaways, impact
}`;

const REPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    overview: { type: "string" },
    programDetails: {
      type: "object",
      properties: {
        description: { type: "string" },
        bullets: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 8,
        },
      },
      required: ["description", "bullets"],
    },
    outcome: { type: "string" },
  },
  required: ["overview", "programDetails", "outcome"],
} as const;

export type GenerateInput = {
  title: string;
  date: string;
  venue: string;
  participants: string;
  highlights: string;
  rawDescription: string;
};

function buildUserMessage(input: GenerateInput): string {
  return [
    `EVENT TITLE: ${input.title || "(not provided)"}`,
    `DATE: ${input.date || "(not provided)"}`,
    `VENUE: ${input.venue || "(not provided)"}`,
    `PARTICIPANTS: ${input.participants || "(not provided)"}`,
    `HIGHLIGHTS (rough notes): ${input.highlights || "(not provided)"}`,
    `RAW DESCRIPTION: ${input.rawDescription || "(not provided)"}`,
  ].join("\n");
}

function tryParseJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  return JSON.parse(trimmed);
}

export async function generateReport(input: GenerateInput): Promise<ReportData> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserMessage(input) },
  ];

  let raw = await callGemini(messages, REPORT_JSON_SCHEMA);
  let parsed: unknown;
  try {
    parsed = tryParseJson(raw);
  } catch {
    parsed = null;
  }

  let result = ReportDataSchema.safeParse(parsed);
  if (!result.success) {
    messages.push({ role: "assistant", content: raw });
    messages.push({
      role: "user",
      content:
        "Your previous reply did not match the schema. Reply again with ONLY the JSON object, no prose. Validation error: " +
        result.error.message,
    });
    raw = await callGemini(messages, REPORT_JSON_SCHEMA);
    try {
      parsed = tryParseJson(raw);
    } catch {
      throw new Error("Model returned invalid JSON twice in a row");
    }
    result = ReportDataSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error("Model output did not match schema: " + result.error.message);
    }
  }

  return result.data;
}
