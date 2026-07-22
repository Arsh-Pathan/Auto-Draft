import { NextResponse } from "next/server";
import { generateReport, type GeneratePhoto } from "@/services/generateReport";
import { processImage } from "@/services/imagePipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { DocType } from "@/types/report";

type Meta = {
  title?: string;
  date?: string;
  venue?: string;
  participants?: string;
  highlights?: string;
  rawDescription?: string;
  instructions?: string;
  photoCaptions?: string[];
  apiKey?: string;
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
};

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let meta: Meta = {};
    let photos: GeneratePhoto[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const metaRaw = form.get("meta");
      if (typeof metaRaw === "string") {
        meta = JSON.parse(metaRaw) as Meta;
      }
      const files = form.getAll("photos").filter((v): v is File => v instanceof File);
      const userCaptions = meta.photoCaptions || [];
      const processed = await Promise.all(files.map(processImage));
      photos = processed.map((p, i) => ({
        mime: p.mime,
        base64: p.buffer.toString("base64"),
        userCaption: userCaptions[i] || "",
      }));
    } else {
      meta = (await req.json()) as Meta;
    }

    const data = await generateReport(
      {
        title: String(meta.title || ""),
        date: String(meta.date || ""),
        venue: String(meta.venue || ""),
        participants: String(meta.participants || ""),
        highlights: String(meta.highlights || ""),
        rawDescription: String(meta.rawDescription || ""),
        instructions: String(meta.instructions || ""),
        photos,
        docType: meta.docType,
        recipient: meta.recipient ? String(meta.recipient) : undefined,
        senderName: meta.senderName ? String(meta.senderName) : undefined,
        senderDesignation: meta.senderDesignation ? String(meta.senderDesignation) : undefined,
        organizedBy: meta.organizedBy ? String(meta.organizedBy) : undefined,
        facultyCoordinator: meta.facultyCoordinator ? String(meta.facultyCoordinator) : undefined,
        startTime: meta.startTime ? String(meta.startTime) : undefined,
        endTime: meta.endTime ? String(meta.endTime) : undefined,
        duration: meta.duration ? String(meta.duration) : undefined,
        projectTrack: meta.projectTrack ? String(meta.projectTrack) : undefined,
        teamStructure: meta.teamStructure ? String(meta.teamStructure) : undefined,
        techStack: meta.techStack ? String(meta.techStack) : undefined,
        totalFinancialRequest: meta.totalFinancialRequest ? String(meta.totalFinancialRequest) : undefined,
      },
      meta.apiKey ? String(meta.apiKey) : undefined
    );

    const captions: Record<number, string> = {};
    for (const sec of data.sections) {
      if (
        sec.type === "image" &&
        typeof sec.imageIndex === "number" &&
        sec.imageCaption
      ) {
        const userCaption = photos[sec.imageIndex]?.userCaption.trim() || "";
        if (!userCaption) {
          captions[sec.imageIndex] = sec.imageCaption;
        }
      }
      if (sec.imageCaption !== undefined) {
        delete sec.imageCaption;
      }
    }

    return NextResponse.json({ ok: true, data, captions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
