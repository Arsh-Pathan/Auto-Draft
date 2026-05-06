import { NextResponse } from "next/server";
import { buildDocx } from "@/backend/docx";
import { docxToPdf } from "@/backend/pdf";
import { processImage } from "@/services/imagePipeline";
import { reportFilename, rfc5987 } from "@/utils/filename";
import type { ReportPayload } from "@/types/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const payloadRaw = form.get("payload");
    if (typeof payloadRaw !== "string") {
      return NextResponse.json({ ok: false, error: "missing payload" }, { status: 400 });
    }
    const payload = JSON.parse(payloadRaw) as ReportPayload;

    const photos = form.getAll("photos").filter((v): v is File => v instanceof File);
    const processed = await Promise.all(photos.map(processImage));

    payload.photographs = payload.photographs.map((p, i) => ({
      ...p,
      src: processed[i]?.dataUrl || p.src,
    }));

    // Generate DOCX first
    const docxBuffer = await buildDocx(payload, processed.filter(p => p !== null) as any);
    
    // Convert DOCX to PDF
    const pdf = await docxToPdf(docxBuffer);

    const filename = reportFilename(payload.meta.date, "pdf");
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${rfc5987(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
