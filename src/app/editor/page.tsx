"use client";
import React, { useMemo, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReportForm } from "@/frontend/ReportForm";
import { LivePreview } from "@/frontend/LivePreview";
import type { LocalPhoto } from "@/frontend/ImageDropzone";
import type { FormState, ReportData, ReportPayload } from "@/types/report";
import { COLLEGE_NAME, REPORT_DEFAULTS, SIGNATORIES } from "@/utils/constants";
import { reportFilename } from "@/utils/filename";

function isoToday(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function EditorContent() {
  const searchParams = useSearchParams();
  const queryType = searchParams.get("type") as "report" | "application" | null;
  const initialDocType = queryType === "application" ? "application" : "report";

  const [form, setForm] = useState<FormState>({
    title: "",
    date: isoToday(),
    venue: "",
    participants: "",
    highlights: "",
    rawDescription: "",
    instructions: "",
    academicYear: REPORT_DEFAULTS.academicYear,
    semester: REPORT_DEFAULTS.semester,
    acaRNo: REPORT_DEFAULTS.acaRNo,
    revNo: REPORT_DEFAULTS.revNo,
    advisor: SIGNATORIES.advisor,
    sdpHead: SIGNATORIES.sdpHead,
    principal: SIGNATORIES.principal,
    docType: initialDocType,
    recipient: "The Principal,\nDhole Patil College of Engineering,\nPune.",
    senderName: "",
    senderDesignation: "Student, Department of AI & ML",
  });

  const [ai, setAi] = useState<ReportData>({
    sections: [
      {
        id: "s1",
        heading: "Overview:",
        type: "text",
        text: "The AI & ML Club organised an event for the students of Dhole Patil College of Engineering. The session aimed to expand awareness of contemporary developments in artificial intelligence and machine learning. Faculty members and student volunteers coordinated the activity, which witnessed enthusiastic participation across multiple departments.",
      },
      {
        id: "s2",
        heading: "Program Details:",
        type: "text",
        text: "The programme commenced with a brief introduction by the club coordinator, followed by structured sessions covering the planned agenda. Participants engaged with the content through demonstrations, discussions, and short interactive segments. The flow allowed each contributor to present their part while leaving room for audience questions at the end of every segment.",
      },
      {
        id: "s3",
        heading: "",
        type: "bullets",
        bullets: [
          "Introduction by the club coordinator",
          "Technical session on the announced topic",
          "Live demonstration and walkthrough",
          "Q&A and audience interaction",
          "Vote of thanks and closing remarks",
        ],
      },
      {
        id: "s4",
        heading: "Overall Outcome:",
        type: "text",
        text: "The event provided participants with practical exposure to current AI/ML practice and strengthened their conceptual foundations. Students reported greater clarity on the subject and expressed interest in follow-up activities. The programme reinforced the club's role in fostering peer learning and academic engagement on campus.",
      }
    ]
  });

  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [busy, setBusy] = useState({ generating: false, pdf: false, docx: false });
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");

  React.useEffect(() => {
    const savedForm = localStorage.getItem("auto_draft_form_state");
    const savedAi = localStorage.getItem("auto_draft_ai_state");
    const savedPhotos = localStorage.getItem("auto_draft_photos");
    const savedKey = localStorage.getItem("auto_draft_api_key");

    if (savedKey) {
      setApiKey(savedKey);
    }

    if (savedForm) {
      try {
        setForm(JSON.parse(savedForm));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedAi) {
      try {
        setAi(JSON.parse(savedAi));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedPhotos) {
      try {
        interface SerializedPhoto {
          id: string;
          name: string;
          type: string;
          dataUrl: string;
          caption: string;
        }
        const parsed = JSON.parse(savedPhotos) as SerializedPhoto[];
        const loadedPhotos = parsed.map((p) => {
          const byteString = atob(p.dataUrl.split(",")[1]);
          const mimeString = p.dataUrl.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const file = new File([blob], p.name, { type: mimeString });
          return {
            id: p.id,
            file,
            dataUrl: p.dataUrl,
            caption: p.caption,
          };
        });
        setPhotos(loadedPhotos);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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
        docType: form.docType,
        recipient: form.recipient,
        senderName: form.senderName,
        senderDesignation: form.senderDesignation,
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
      const fd = new FormData();
      fd.append(
        "meta",
        JSON.stringify({
          title: form.title,
          date: form.date,
          venue: form.venue,
          participants: form.participants,
          highlights: form.highlights,
          rawDescription: form.rawDescription,
          instructions: form.instructions,
          apiKey: apiKey || undefined,
          photoCaptions: photos.map((p) => p.caption),
          docType: form.docType,
          recipient: form.recipient,
          senderName: form.senderName,
          senderDesignation: form.senderDesignation,
        })
      );
      photos.forEach((p) => fd.append("photos", p.file, p.file.name));

      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (res.status === 429 || json.error?.includes("quota") || json.error?.includes("API_KEY is not set")) {
          throw new Error("QUOTA_EXCEEDED: " + (json.error || "API Quota Exceeded"));
        }
        throw new Error(json.error || "Generation failed");
      }
      const generatedAi = json.data as ReportData;
      setAi(generatedAi);
      if (generatedAi.generatedTitle) {
        setForm({ ...form, title: generatedAi.generatedTitle });
      }
      const captions = (json.captions || {}) as Record<string, string>;
      if (Object.keys(captions).length > 0) {
        setPhotos(
          photos.map((p, i) => {
            const ai = captions[String(i)];
            if (ai && p.caption.trim() === "") {
              return { ...p, caption: ai };
            }
            return p;
          })
        );
      }
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/logo.svg"
                alt="Dhole Patil Education Society"
                width={629}
                height={539}
                className="h-[88px] w-auto shrink-0 self-start"
              />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
                AI &amp; ML Club Document Generator
              </p>
              <h1 className="text-2xl font-semibold text-ink">
                AutoReport &amp; Draft
              </h1>
              <p className="text-sm text-gray-600">
                Gemini-backed reports &amp; applications for Dhole Patil College of Engineering,
                with live preview, PDF, and DOCX export.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 transition-all hover:scale-[1.02]"
            >
              Back to Menu
            </Link>
            <a
              href={`/wizard?type=${form.docType}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Guided Draft Wizard
            </a>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm lg:col-span-5">
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
            apiKey={apiKey}
            setApiKey={(key) => {
              setApiKey(key);
              localStorage.setItem("auto_draft_api_key", key);
            }}
          />
        </section>

        <section className="lg:sticky lg:top-6 self-start lg:col-span-7">
          <LivePreview
            payload={payload}
            onPreviewEdit={(id, field, value) => {
              setAi(prev => ({
                ...prev,
                sections: prev.sections.map(sec => {
                  if (sec.id === id) {
                    if (field === 'text' || field === 'heading') {
                      return { ...sec, [field]: value as string };
                    } else if (field === 'bullets') {
                      return { ...sec, bullets: value as string[] };
                    } else if (field === 'table') {
                      return { ...sec, table: value as string[][] };
                    }
                  }
                  return sec;
                })
              }));
            }}
          />
        </section>
      </div>

      <footer className="mt-10 text-xs text-gray-500 flex items-center justify-between">
        <span>Built with Next.js, Gemini, Puppeteer &amp; docx.</span>
      </footer>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 font-semibold">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
