"use client";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { ImageDropzone, type LocalPhoto } from "./ImageDropzone";
import type { FormState, ReportData } from "@/types/report";

type Props = {
  form: FormState;
  setForm: (f: FormState) => void;
  ai: ReportData;
  setAi: (a: ReportData) => void;
  photos: LocalPhoto[];
  setPhotos: (p: LocalPhoto[]) => void;
  onGenerate: () => void;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  busy: { generating: boolean; pdf: boolean; docx: boolean };
  error: string | null;
};

export function ReportForm({
  form,
  setForm,
  ai,
  setAi,
  photos,
  setPhotos,
  onGenerate,
  onDownloadPdf,
  onDownloadDocx,
  busy,
  error,
}: Props) {
  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value });

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-ink">Event details</legend>
        <Field
          label="Event title"
          value={form.title}
          onChange={update("title")}
          placeholder="Research Paper Presentation"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Date"
            type="date"
            value={form.date}
            onChange={update("date")}
          />
          <Field
            label="Venue"
            value={form.venue}
            onChange={update("venue")}
            placeholder="Seminar Hall, A-Block"
          />
        </div>
        <TextArea
          label="Participants"
          rows={2}
          value={form.participants}
          onChange={update("participants")}
          placeholder="TE & BE AI/ML students, faculty coordinators..."
        />
        <TextArea
          label="Highlights (rough notes)"
          rows={3}
          value={form.highlights}
          onChange={update("highlights")}
          placeholder="key topics, demos, speakers, anything notable"
        />
        <TextArea
          label="Raw description"
          rows={5}
          value={form.rawDescription}
          onChange={update("rawDescription")}
          placeholder="Describe the event freely. Gemini will reorganise this."
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-ink">Header & signatories</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Academic year"
            value={form.academicYear}
            onChange={update("academicYear")}
          />
          <Field label="Semester" value={form.semester} onChange={update("semester")} />
          <Field label="ACA/R No." value={form.acaRNo} onChange={update("acaRNo")} />
          <Field label="Rev No." value={form.revNo} onChange={update("revNo")} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Club Advisor" value={form.advisor} onChange={update("advisor")} />
          <Field label="SDP Head" value={form.sdpHead} onChange={update("sdpHead")} />
          <Field label="Principal" value={form.principal} onChange={update("principal")} />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-base font-semibold text-ink">Photographs</legend>
        <ImageDropzone
          photos={photos}
          onAdd={(added) => setPhotos([...photos, ...added])}
          onRemove={(id) => setPhotos(photos.filter((p) => p.id !== id))}
          onCaption={(id, caption) =>
            setPhotos(photos.map((p) => (p.id === id ? { ...p, caption } : p)))
          }
        />
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onGenerate} disabled={busy.generating}>
          {busy.generating ? "Generating..." : "Generate with Gemini"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onDownloadPdf}
          disabled={busy.pdf}
        >
          {busy.pdf ? "Building PDF..." : "Download PDF"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onDownloadDocx}
          disabled={busy.docx}
        >
          {busy.docx ? "Building DOCX..." : "Download DOCX"}
        </Button>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <fieldset className="space-y-4 border-t border-gray-200 pt-3">
        <legend className="text-base font-semibold text-ink">
          AI output (edit before download)
        </legend>
        <TextArea
          label="Overview"
          rows={4}
          value={ai.overview}
          onChange={(e) => setAi({ ...ai, overview: e.target.value })}
        />
        <TextArea
          label="Program details - description"
          rows={4}
          value={ai.programDetails.description}
          onChange={(e) =>
            setAi({
              ...ai,
              programDetails: { ...ai.programDetails, description: e.target.value },
            })
          }
        />
        <TextArea
          label="Program details - bullet points (one per line)"
          rows={5}
          value={ai.programDetails.bullets.join("\n")}
          onChange={(e) =>
            setAi({
              ...ai,
              programDetails: {
                ...ai.programDetails,
                bullets: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              },
            })
          }
        />
        <TextArea
          label="Overall outcome"
          rows={4}
          value={ai.outcome}
          onChange={(e) => setAi({ ...ai, outcome: e.target.value })}
        />
      </fieldset>
    </form>
  );
}
