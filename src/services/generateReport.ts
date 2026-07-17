import "server-only";
import { ReportDataSchema, type ReportData } from "@/types/report";
import { callGemini, type ChatMessage, type ChatImage } from "@/backend/gemini";

const SYSTEM_PROMPT = `You are a formal academic report writer for the AI & ML Club at Dhole Patil College of Engineering. Convert the user's messy notes into a structured event report.

Tone: formal, third person, past tense, no marketing fluff, no emojis, Indian English spelling. Do not invent facts that are not implied by the input. If a detail is missing, write generally rather than fabricating specifics.

Return ONLY a JSON object matching this schema. No prose, no markdown, no code fences.

{
  "generatedTitle": "String (Create a professional, formal academic report title for the event if the user provided a weak one or none at all, e.g. 'Meta x PyTorch OpenEnv Hackathon Report')",
  "sections": [
    {
      "id": "unique-string-id",
      "heading": "String (e.g. 'Overview', 'Program Details', 'Objectives'). Leave empty for image sections.",
      "type": "text | bullets | table | image",
      "text": "String (only if type is 'text')",
      "bullets": ["String array"] (only if type is 'bullets'),
      "table": [["Row 1 Col 1", "Row 1 Col 2"], ["Row 2 Col 1", "Row 2 Col 2"]] (only if type is 'table'),
      "imageIndex": 0 (only if type is 'image', integer corresponding to uploaded photos index),
      "imageCaption": "String (only if type is 'image'). A short, formal label (max ~12 words) describing what the photograph shows. Examples: 'Participants engaging in the hands-on session', 'Keynote address by the chief guest'."
    }
  ]
}

Structure the report intelligently. Use tables if appropriate for comparing data or schedules. Use bullets for objectives or key points.

PHOTO HANDLING:
- The user attaches photographs as inline images in this conversation, in the same order as the PHOTOS list in the user message.
- Look at each image and use it to inform the placement and caption.
- Emit one section with type "image" for EVERY photograph supplied, using imageIndex 0..N-1 matching the photo order.
- Place each image section at a contextually appropriate point in the report (e.g. after the section it visually illustrates), interleaved between text/bullet sections, NOT all clumped at the end.
- imageCaption must be a formal, descriptive label written by you based on what is visible in the photo. The user's hand-typed caption (if any) is shown in the PHOTOS list; if the user supplied one, you may reuse or refine it, otherwise write your own.
- Image sections should have heading set to an empty string.

If no photos are supplied, do not emit any image sections.`;

const SYSTEM_PROMPT_APPLICATION = `You are a formal academic letter writer for Dhole Patil College of Engineering. Convert the user's raw notes and requirements into a structured, formal letter (e.g., leave application, permission request, budget approval).

Tone: formal, respectful, polite, first or third person as appropriate, no marketing fluff, no emojis, Indian English spelling. Write professionally, addressing the recipient appropriately. Do not invent facts not implied by the input.

Return ONLY a JSON object matching this schema. No prose, no markdown, no code fences.

{
  "generatedTitle": "String (A short, professional Subject for the application, e.g., 'Permission to Book Seminar Hall for AI Workshop')",
  "sections": [
    {
      "id": "unique-string-id",
      "heading": "String (Optional section headings if the application has sub-sections like 'Timeline', 'Budget Overview'. Otherwise leave empty for standard letter paragraphs).",
      "type": "text | bullets | table",
      "text": "String (only if type is 'text' - used for the main paragraphs of the letter)",
      "bullets": ["String array"] (only if type is 'bullets'),
      "table": [["Col 1", "Col 2"]] (only if type is 'table')
    }
  ]
}

Structure the letter intelligently. Ensure it is addressed properly and flows logically from introduction to specific request and explanation, concluding politely.`;

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
          imageCaption: { type: "string" },
        },
        required: ["id", "heading", "type"],
      },
    },
  },
  required: ["sections"],
} as const;

export type GeneratePhoto = {
  mime: string;
  base64: string;
  userCaption: string;
};

export type GenerateInput = {
  title: string;
  date: string;
  venue: string;
  participants: string;
  highlights: string;
  rawDescription: string;
  instructions: string;
  photos?: GeneratePhoto[];
  docType?: "report" | "application";
  recipient?: string;
  senderName?: string;
  senderDesignation?: string;
};

function buildUserMessage(input: GenerateInput): string {
  if (input.docType === "application") {
    const base = [
      `DOCUMENT TYPE: Academic Letter / Application`,
      `SUBJECT/TITLE: ${input.title || "(not provided)"}`,
      `DATE: ${input.date || "(not provided)"}`,
      `RECIPIENT: ${input.recipient || "(not provided)"}`,
      `SENDER NAME: ${input.senderName || "(not provided)"}`,
      `SENDER DESIGNATION: ${input.senderDesignation || "(not provided)"}`,
      `RAW DESCRIPTION / DETAILS: ${input.rawDescription || "(not provided)"}`,
      `KEY HIGHLIGHTS / NOTES: ${input.highlights || "(not provided)"}`,
    ];
    if (input.instructions) {
      base.push(`\nSPECIAL USER INSTRUCTIONS:\n${input.instructions}`);
    }
    return base.join("\n");
  }

  const base = [
    `EVENT TITLE: ${input.title || "(not provided)"}`,
    `DATE: ${input.date || "(not provided)"}`,
    `VENUE: ${input.venue || "(not provided)"}`,
    `PARTICIPANTS: ${input.participants || "(not provided)"}`,
    `HIGHLIGHTS (rough notes): ${input.highlights || "(not provided)"}`,
    `RAW DESCRIPTION: ${input.rawDescription || "(not provided)"}`,
  ];
  if (input.photos && input.photos.length > 0) {
    const lines = input.photos.map((p, i) => {
      const cap = p.userCaption.trim();
      return `[${i}] user caption: ${cap ? JSON.stringify(cap) : "(empty)"}`;
    });
    base.push("");
    base.push("PHOTOS (uploaded by user, in order, attached as images below):");
    base.push(...lines);
  } else {
    base.push("");
    base.push("PHOTOS: (none uploaded)");
  }
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
  const images: ChatImage[] | undefined = input.photos?.map((p) => ({
    mime: p.mime,
    base64: p.base64,
  }));

  const systemPrompt = input.docType === "application" ? SYSTEM_PROMPT_APPLICATION : SYSTEM_PROMPT;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: buildUserMessage(input),
      images,
    },
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
    raw = await callGemini(messages, REPORT_JSON_SCHEMA, userApiKey);
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
