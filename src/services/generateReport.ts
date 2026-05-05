import "server-only";
import { ReportDataSchema, type ReportData } from "@/types/report";
import { callGemini, type ChatMessage } from "@/backend/gemini";

const SYSTEM_PROMPT = `You are a formal academic report writer for the AI & ML Club at Dhole Patil College of Engineering. Convert the user's messy notes into a structured event report.

Tone: formal, third person, past tense, no marketing fluff, no emojis, Indian English spelling. Do not invent facts that are not implied by the input. If a detail is missing, write generally rather than fabricating specifics.

Return ONLY a JSON object matching this schema. No prose, no markdown, no code fences.

{
  "generatedTitle": "String (Create a professional, formal academic report title for the event if the user provided a weak one or none at all, e.g. 'Meta x PyTorch OpenEnv Hackathon Report')",
  "sections": [
    {
      "id": "unique-string-id",
      "heading": "String (e.g. 'Overview', 'Program Details', 'Objectives')",
      "type": "text | bullets | table | image",
      "text": "String (only if type is 'text')",
      "bullets": ["String array"] (only if type is 'bullets'),
      "table": [["Row 1 Col 1", "Row 1 Col 2"], ["Row 2 Col 1", "Row 2 Col 2"]] (only if type is 'table'),
      "imageIndex": 0 (only if type is 'image', integer corresponding to uploaded photos index)
    }
  ]
}

Structure the report intelligently. Use tables if appropriate for comparing data or schedules. Use bullets for objectives or key points. You may omit image sections if the user didn't mention them.`;

const REPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    generatedTitle: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          heading: { type: "string" },
          type: { type: "string", enum: ["text", "bullets", "table", "image"] },
          text: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
          table: { type: "array", items: { type: "array", items: { type: "string" } } },
          imageIndex: { type: "number" },
        },
        required: ["id", "heading", "type"],
      },
    },
  },
  required: ["sections"],
} as const;

export type GenerateInput = {
  title: string;
  date: string;
  venue: string;
  participants: string;
  highlights: string;
  rawDescription: string;
  instructions: string;
};

function buildUserMessage(input: GenerateInput): string {
  const base = [
    `EVENT TITLE: ${input.title || "(not provided)"}`,
    `DATE: ${input.date || "(not provided)"}`,
    `VENUE: ${input.venue || "(not provided)"}`,
    `PARTICIPANTS: ${input.participants || "(not provided)"}`,
    `HIGHLIGHTS (rough notes): ${input.highlights || "(not provided)"}`,
    `RAW DESCRIPTION: ${input.rawDescription || "(not provided)"}`,
  ];
  if (input.instructions) {
    base.push(`\nSPECIAL USER INSTRUCTIONS:\n${input.instructions}`);
  }
  return base.join("\n");
}

function tryParseJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  return JSON.parse(trimmed);
}

export async function generateReport(input: GenerateInput, userApiKey?: string): Promise<ReportData> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserMessage(input) },
  ];

  let raw = await callGemini(messages, REPORT_JSON_SCHEMA, userApiKey);
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
