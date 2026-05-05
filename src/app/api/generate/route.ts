import { NextResponse } from "next/server";
import { generateReport } from "@/services/generateReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await generateReport({
      title: String(body.title || ""),
      date: String(body.date || ""),
      venue: String(body.venue || ""),
      participants: String(body.participants || ""),
      highlights: String(body.highlights || ""),
      rawDescription: String(body.rawDescription || ""),
      instructions: String(body.instructions || ""),
    });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
