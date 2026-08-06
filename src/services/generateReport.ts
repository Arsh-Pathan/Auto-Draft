import "server-only";
import { ReportDataSchema, type ReportData, type DocType, type FormState } from "@/types/report";
import { callGemini, type ChatMessage, type ChatImage } from "@/backend/gemini";

const SYSTEM_PROMPT = `You are a formal academic report writer for the AI & ML Club at Dhole Patil College of Engineering. Convert the user's notes and chat requests into a structured event report and extracted metadata.

Tone: formal, third person, past tense, no marketing fluff, no emojis, Indian English spelling. Do not invent facts that are not implied by the input.

Return ONLY a JSON object matching this schema. No prose, no markdown, no code fences.

{
  "generatedTitle": "String (Create a professional, formal academic report title for the event if the user provided a weak one or none at all)",
  "extractedMetadata": {
    "recipient": "String (If the user specified a recipient like 'To Teacher Guardian', format as formal multi-line address)",
    "senderName": "String (Sender name if mentioned, e.g. 'Arsh Pathan')",
    "senderDesignation": "String (Sender designation if mentioned)",
    "date": "String (Date formatted YYYY-MM-DD or formal date)",
    "advisor": "String (Club Advisor name/designation if requested to add/update signature of club advisor)",
    "sdpHead": "String (SDP Head name/designation if requested)",
    "principal": "String (Principal name/designation if requested)"
  },
  "sections": [
    {
      "id": "unique-string-id",
      "heading": "String (e.g. 'Overview', 'Program Details', 'Objectives'). Leave empty for image sections.",
      "type": "text | bullets | table | image",
      "text": "String (only if type is 'text')",
      "bullets": ["String array"] (only if type is 'bullets'),
      "table": [["Row 1 Col 1", "Row 1 Col 2"], ["Row 2 Col 1", "Row 2 Col 2"]] (only if type is 'table'),
      "imageIndex": 0 (only if type is 'image', integer corresponding to uploaded photos index),
      "imageCaption": "String (only if type is 'image')."
    }
  ]
}

Structure the report intelligently. Extract metadata updates if present in raw notes or instructions.`;

const SYSTEM_PROMPT_APPLICATION = `You are an intelligent formal academic letter writer & metadata extractor for Dhole Patil College of Engineering.
Convert the user's raw input, notes, and chat requests into structured letter body sections AND extracted header metadata (recipient address, sender, signatures, date).

CRITICAL CONSTRAINTS FOR METADATA EXTRACTION:
1. For "extractedMetadata.recipient": DO NOT start with "To," or "To,". Output ONLY the formal designation and department lines (e.g. "The Teacher Guardian,\nDepartment of Artificial Intelligence and Machine Learning,\nDhole Patil College of Engineering, Pune.").
2. If the user mentions sender details (e.g. "From Arsh Pathan", "Student, Dept of AI & ML"), extract "extractedMetadata.senderName" and "extractedMetadata.senderDesignation".
3. SIGNATORY LIST EXTRACTION:
   - If the user explicitly specifies which signatories to include or remove (e.g., "add signature of club advisor and the tg noone else", "remove principal sir", "only club advisor and teacher guardian"), output "extractedMetadata.signatoryList" containing ONLY those requested signatories as an array of objects:
     [ { "title": "Club Advisor", "name": "Prof. Yugashree Pawar" }, { "title": "Teacher Guardian", "name": "Department TG Coordinator" } ].
   - If the user asks to "remove principal sir" or "no one else", DO NOT include Principal Sir or other non-requested titles in "extractedMetadata.signatoryList"!

CRITICAL CONSTRAINTS FOR SECTIONS:
1. Output ONLY the main body paragraphs of the letter inside the "sections" array.
2. DO NOT include section headings! Leave the "heading" field EMPTY or omitted for all sections in application letters. Applications must consist of clean, continuous body paragraphs without bold subheadings.
3. DO NOT include headers, titles (like "APPLICATION"), date ("Date: ..."), "To,", recipient addresses, "From,", sender addresses, "Subject:", salutations ("Respected Sir/Madam,"), closings ("Thanking You.", "Yours faithfully"), or signature lines inside the "sections" text. The visual document template ALREADY renders all of these outer letter elements automatically from the metadata!
4. Each item in "sections" should be a clear, well-written body paragraph explaining the request, background context, justification, and respectful closing request.

Return ONLY a JSON object matching the schema. No prose, no markdown, no code fences.`;

const SYSTEM_PROMPT_CLOSING_MEETING = `You are a formal academic report writer & metadata extractor for Student Development Program (SDP) & AI & ML Club at Dhole Patil College of Engineering. Produce structured content and extracted metadata for a Closing Meeting Report.

Extract metadata (organizedBy, facultyCoordinator, date, venue, startTime, endTime, duration, advisor, sdpHead, principal) into "extractedMetadata" if mentioned or requested.

Generate sections corresponding to:
1. Brief description of the event (heading: "1. Brief Description of the Event", type: "text")
2. Event Summary (heading: "2. Event Summary", type: "bullets" or "text")
3. Challenges Faced During Conduction (heading: "3. Challenges Faced During Conduction", type: "bullets")
4. Suggestions & Recommendations from organizing team members (heading: "4. Suggestions & Recommendations from Organizing Team Members", type: "bullets")
5. Suggestions & Recommendations from Management (heading: "5. Suggestions & Recommendations from Management", type: "bullets")

Tone: formal, objective, constructive, Indian English spelling.`;

const SYSTEM_PROMPT_PROJECT_PROPOSAL = `You are a technical proposal writer & metadata extractor for the AI & ML Club at Dhole Patil College of Engineering. Produce structured sections and extracted metadata for an official Project Proposal Form.

Extract metadata (projectTrack, teamStructure, techStack, totalFinancialRequest, senderName) into "extractedMetadata" if mentioned or requested.

Generate sections covering:
1. Executive Concept Overview (heading: "Concept Overview", type: "text")
2. Technical Architecture & Tech Stack (heading: "Technical Architecture & Stack", type: "bullets")
3. Resource & Component Requirements (heading: "Required Resources & Components", type: "table" or "bullets")
4. Implementation Plan & Milestones (heading: "30-Day Sprint Milestones", type: "bullets")
5. Expected Outcomes & Deliverables (heading: "Expected Project Outcomes", type: "text")

Tone: technical, innovative, precise, professional.`;

const REPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    generatedTitle: { type: "string" },
    extractedMetadata: {
      type: "object",
      properties: {
        recipient: { type: "string" },
        senderName: { type: "string" },
        senderDesignation: { type: "string" },
        date: { type: "string" },
        advisor: { type: "string" },
        sdpHead: { type: "string" },
        principal: { type: "string" },
        eventCoordinator: { type: "string" },
        technicalLead: { type: "string" },
        organizedBy: { type: "string" },
        facultyCoordinator: { type: "string" },
        projectTrack: { type: "string" },
        teamStructure: { type: "string" },
        techStack: { type: "string" },
        signatoryList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              name: { type: "string" },
            },
            required: ["title"],
          },
        },
      },
    },
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
        required: ["id", "type"],
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
  docType?: DocType;
  recipient?: string;
  senderName?: string;
  senderDesignation?: string;
  organizedBy?: string;
  facultyCoordinator?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  projectTrack?: string;
  teamStructure?: string;
  techStack?: string;
  totalFinancialRequest?: string;
  advisor?: string;
  sdpHead?: string;
  principal?: string;
  existingSections?: ReportSection[];
};

export function applyExtractedMetadata(form: FormState, data: ReportData): FormState {
  const updated = { ...form };
  if (data.generatedTitle) {
    updated.title = data.generatedTitle;
  }
  if (data.extractedMetadata) {
    const meta = data.extractedMetadata;
    if (meta.recipient) updated.recipient = meta.recipient;
    if (meta.senderName) updated.senderName = meta.senderName;
    if (meta.senderDesignation) updated.senderDesignation = meta.senderDesignation;
    if (meta.date) updated.date = meta.date;
    if (meta.advisor) updated.advisor = meta.advisor;
    if (meta.sdpHead) updated.sdpHead = meta.sdpHead;
    if (meta.principal) updated.principal = meta.principal;
    if (meta.eventCoordinator) updated.eventCoordinator = meta.eventCoordinator;
    if (meta.technicalLead) updated.technicalLead = meta.technicalLead;
    if (meta.organizedBy) updated.organizedBy = meta.organizedBy;
    if (meta.facultyCoordinator) updated.facultyCoordinator = meta.facultyCoordinator;
    if (meta.projectTrack) updated.projectTrack = meta.projectTrack;
    if (meta.teamStructure) updated.teamStructure = meta.teamStructure;
    if (meta.techStack) updated.techStack = meta.techStack;
    if (meta.signatoryList) updated.signatoryList = meta.signatoryList;
  }
  return updated;
}

function formatExistingSections(sections?: ReportSection[]): string {
  if (!sections || sections.length === 0) return "";
  return sections
    .map((sec, i) => {
      let val = "";
      if (sec.type === "text") val = sec.text || "";
      else if (sec.type === "bullets") val = (sec.bullets || []).map((b) => `- ${b}`).join("\n");
      else if (sec.type === "table") val = JSON.stringify(sec.table || []);
      return `Section ${i + 1} [id: ${sec.id}, type: ${sec.type}, heading: "${sec.heading || ""}"]:\n${val}`;
    })
    .join("\n\n");
}

function buildUserMessage(input: GenerateInput): string {
  const existingFormatted = formatExistingSections(input.existingSections);

  if (input.docType === "application") {
    const base = [
      `DOCUMENT TYPE: Academic Letter / Application`,
      `SUBJECT/TITLE: ${input.title || "(not provided)"}`,
      `DATE: ${input.date || "(not provided)"}`,
      `CURRENT RECIPIENT: ${input.recipient || "(not provided)"}`,
      `CURRENT SENDER NAME: ${input.senderName || "(not provided)"}`,
      `CURRENT SENDER DESIGNATION: ${input.senderDesignation || "(not provided)"}`,
      `CURRENT CLUB ADVISOR SIGNATURE: ${input.advisor || "(not provided)"}`,
      `RAW DESCRIPTION / DETAILS: ${input.rawDescription || "(not provided)"}`,
      `KEY HIGHLIGHTS / NOTES: ${input.highlights || "(not provided)"}`,
    ];
    if (existingFormatted) {
      base.push(`\nCURRENT EXISTING DOCUMENT BODY SECTIONS:\n${existingFormatted}`);
    }
    if (input.instructions) {
      base.push(`\nUSER REVISION / CHAT REQUEST:\n${input.instructions}\n(Mandate: Apply this request to edit, refine, or rewrite the document sections and metadata above.)`);
    }
    return base.join("\n");
  }

  if (input.docType === "closing_meeting") {
    const base = [
      `DOCUMENT TYPE: Closing Meeting Report`,
      `EVENT TITLE: ${input.title || "(not provided)"}`,
      `ORGANIZED BY: ${input.organizedBy || "(not provided)"}`,
      `FACULTY COORDINATOR: ${input.facultyCoordinator || "(not provided)"}`,
      `DATE: ${input.date || "(not provided)"}`,
      `VENUE: ${input.venue || "(not provided)"}`,
      `START TIME: ${input.startTime || "(not provided)"}`,
      `END TIME: ${input.endTime || "(not provided)"}`,
      `TOTAL DURATION: ${input.duration || "(not provided)"}`,
      `PARTICIPANTS: ${input.participants || "(not provided)"}`,
      `RAW NOTES / WHAT HAPPENED: ${input.rawDescription || "(not provided)"}`,
      `KEY HIGHLIGHTS / CHALLENGES: ${input.highlights || "(not provided)"}`,
    ];
    if (existingFormatted) {
      base.push(`\nCURRENT EXISTING DOCUMENT SECTIONS:\n${existingFormatted}`);
    }
    if (input.instructions) {
      base.push(`\nUSER REVISION / CHAT REQUEST:\n${input.instructions}\n(Mandate: Apply this request to edit, refine, or rewrite the document sections and metadata above.)`);
    }
    return base.join("\n");
  }

  if (input.docType === "project_proposal") {
    const base = [
      `DOCUMENT TYPE: AI & ML Project Proposal Form`,
      `PROJECT TITLE: ${input.title || "(not provided)"}`,
      `TRACK: ${input.projectTrack || "(not provided)"}`,
      `TEAM STRUCTURE: ${input.teamStructure || "(not provided)"}`,
      `TECH STACK: ${input.techStack || "(not provided)"}`,
      `FINANCIAL REQUEST: ${input.totalFinancialRequest || "(not provided)"}`,
      `RAW DESCRIPTION / CONCEPT: ${input.rawDescription || "(not provided)"}`,
      `KEY HIGHLIGHTS / REQUIREMENTS: ${input.highlights || "(not provided)"}`,
    ];
    if (existingFormatted) {
      base.push(`\nCURRENT EXISTING DOCUMENT SECTIONS:\n${existingFormatted}`);
    }
    if (input.instructions) {
      base.push(`\nUSER REVISION / CHAT REQUEST:\n${input.instructions}\n(Mandate: Apply this request to edit, refine, or rewrite the document sections and metadata above.)`);
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
    base.push(`\nSPECIAL USER INSTRUCTIONS / CHAT REQUEST:\n${input.instructions}`);
  }
  return base.join("\n");
}

function tryParseJson(raw: string): unknown {
  let trimmed = raw.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    trimmed = jsonMatch[1].trim();
  } else {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      trimmed = trimmed.substring(start, end + 1);
    }
  }
  return JSON.parse(trimmed);
}

function getSystemPrompt(docType?: DocType): string {
  switch (docType) {
    case "application":
      return SYSTEM_PROMPT_APPLICATION;
    case "closing_meeting":
      return SYSTEM_PROMPT_CLOSING_MEETING;
    case "project_proposal":
      return SYSTEM_PROMPT_PROJECT_PROPOSAL;
    default:
      return SYSTEM_PROMPT;
  }
}

export async function generateReport(input: GenerateInput, userApiKey?: string): Promise<ReportData> {
  const images: ChatImage[] | undefined = input.photos?.map((p) => ({
    mime: p.mime,
    base64: p.base64,
  }));

  const systemPrompt = getSystemPrompt(input.docType);

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
