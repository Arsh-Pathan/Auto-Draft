"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ReportForm } from "@/frontend/ReportForm";
import { LivePreview } from "@/frontend/LivePreview";
import type { LocalPhoto } from "@/frontend/ImageDropzone";
import type { FormState, ReportData, ReportPayload } from "@/types/report";
import { COLLEGE_NAME, REPORT_DEFAULTS, SIGNATORIES } from "@/utils/constants";
import { reportFilename } from "@/utils/filename";

const EMPTY_AI: ReportData = {
  overview:
    "The AI & ML Club organised an event for the students of Dhole Patil College of Engineering. The session aimed to expand awareness of contemporary developments in artificial intelligence and machine learning. Faculty members and student volunteers coordinated the activity, which witnessed enthusiastic participation across multiple departments.",
  programDetails: {
    description:
      "The programme commenced with a brief introduction by the club coordinator, followed by structured sessions covering the planned agenda. Participants engaged with the content through demonstrations, discussions, and short interactive segments. The flow allowed each contributor to present their part while leaving room for audience questions at the end of every segment.",
    bullets: [
      "Introduction by the club coordinator",
      "Technical session on the announced topic",
      "Live demonstration and walkthrough",
      "Q&A and audience interaction",
      "Vote of thanks and closing remarks",
    ],
  },
  outcome:
    "The event provided participants with practical exposure to current AI/ML practice and strengthened their conceptual foundations. Students reported greater clarity on the subject and expressed interest in follow-up activities. The programme reinforced the club's role in fostering peer learning and academic engagement on campus.",
};

function isoToday(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const INITIAL_FORM: FormState = {
  title: "Research Paper Presentation Report",
  date: "",
  venue: "",
  participants: "",
  highlights: "",
  rawDescription: "",
  academicYear: REPORT_DEFAULTS.academicYear,
  semester: REPORT_DEFAULTS.semester,
  acaRNo: REPORT_DEFAULTS.acaRNo,
  revNo: REPORT_DEFAULTS.revNo,
  advisor: SIGNATORIES.advisor,
  sdpHead: SIGNATORIES.sdpHead,
  principal: SIGNATORIES.principal,
};

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [ai, setAi] = useState<ReportData>(EMPTY_AI);
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [busy, setBusy] = useState({ generating: false, pdf: false, docx: false });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!form.date) setForm((f) => ({ ...f, date: isoToday() }));
  }, [form.date]);

  const payload: ReportPayload = useMemo(
    () => ({
      meta: {
        college: COLLEGE_NAME,
        academicYear: form.academicYear,
        semester: form.semester,
        title: form.title,
        date: form.date,
        venue: form.venue,
        participants: form.participants,
        acaRNo: form.acaRNo,
        revNo: form.revNo,
      },
      ai,
      photographs: photos.map((p) => ({ src: p.dataUrl, caption: p.caption })),
      signatories: {
        advisor: form.advisor,
        sdpHead: form.sdpHead,
        principal: form.principal,
      },
    }),
    [form, ai, photos]
  );

  async function onGenerate() {
    setError(null);
    setBusy((b) => ({ ...b, generating: true }));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          date: form.date,
          venue: form.venue,
          participants: form.participants,
          highlights: form.highlights,
          rawDescription: form.rawDescription,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Generation failed");
      setAi(json.data as ReportData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy((b) => ({ ...b, generating: false }));
    }
  }

  async function downloadFromForm(
    endpoint: "/api/pdf" | "/api/docx",
    ext: "pdf" | "docx",
    flag: "pdf" | "docx"
  ) {
    setError(null);
    setBusy((b) => ({ ...b, [flag]: true }));
    try {
      const fd = new FormData();
      fd.append("payload", JSON.stringify(payload));
      photos.forEach((p) => fd.append("photos", p.file, p.file.name));

      const res = await fetch(endpoint, { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = reportFilename(form.date, ext);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy((b) => ({ ...b, [flag]: false }));
    }
  }

  return (
    <main className="min-h-screen px-6 py-6 mx-auto max-w-[1400px]">
      <header className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Image
            src="/college-logo.svg"
            alt="Dhole Patil Education Society"
            width={629}
            height={539}
            className="h-[88px] w-auto shrink-0 self-start"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
              AI &amp; ML Club Report Generator
            </p>
            <h1 className="text-2xl font-semibold text-ink">
              AutoReport
            </h1>
            <p className="text-sm text-gray-600">
              Gemini-backed activity reports for Dhole Patil College of Engineering,
              with live preview, PDF export, and DOCX export aligned to the provided
              college format.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <ReportForm
            form={form}
            setForm={setForm}
            ai={ai}
            setAi={setAi}
            photos={photos}
            setPhotos={setPhotos}
            onGenerate={onGenerate}
            onDownloadPdf={() => downloadFromForm("/api/pdf", "pdf", "pdf")}
            onDownloadDocx={() => downloadFromForm("/api/docx", "docx", "docx")}
            busy={busy}
            error={error}
          />
        </section>

        <section className="lg:sticky lg:top-6 self-start">
          <h2 className="mb-2 text-sm font-medium text-gray-600 uppercase tracking-wide">
            Live preview
          </h2>
          <LivePreview payload={payload} />
        </section>
      </div>

      <footer className="mt-10 text-xs text-gray-500">
        Built with Next.js, Gemini, Puppeteer & docx.
      </footer>
    </main>
  );
}
