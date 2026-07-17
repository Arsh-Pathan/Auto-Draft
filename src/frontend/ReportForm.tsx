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
  apiKey: string;
  setApiKey: (key: string) => void;
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
  apiKey,
  setApiKey,
}: Props) {
  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value });

  const isQuotaError = error?.includes("QUOTA_EXCEEDED") || error?.includes("GEMINI_API_KEY");
  const displayError = isQuotaError ? "The server's Google Gemini API key is missing or the quota has been exceeded." : error;

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

      {form.docType === "application" ? (
        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-ink">Application details</legend>
          <Field
            label="Application Subject / Title"
            value={form.title}
            onChange={update("title")}
            placeholder="e.g. Permission request to book Seminar Hall"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Date"
              type="date"
              value={form.date}
              onChange={update("date")}
            />
            <Field
              label="Sender Name"
              value={form.senderName || ""}
              onChange={update("senderName")}
              placeholder="e.g. Arsh Pathan"
            />
          </div>
          <Field
            label="Sender Designation / Roll No"
            value={form.senderDesignation || ""}
            onChange={update("senderDesignation")}
            placeholder="e.g. President, AI & ML Club / TE student"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Addressed To (Recipient)</label>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              value={form.recipient || ""}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              placeholder="e.g. The Principal,&#10;Dhole Patil College of Engineering,&#10;Pune."
            />
          </div>
          <TextArea
            label="Highlights (rough notes)"
            rows={2}
            value={form.highlights}
            onChange={update("highlights")}
            placeholder="e.g. Guest speaker Prof. Mane, 50+ students expected..."
          />
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Raw description</label>
              <textarea
                className="w-full rounded border px-3 py-2 text-sm border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                value={form.rawDescription}
                onChange={(e) => setForm({ ...form, rawDescription: e.target.value })}
                placeholder="Describe the application requirements freely. Gemini will generate the formal text."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Specific AI Instructions (Optional)</label>
              <textarea
                className="w-full rounded border px-3 py-2 text-sm border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="E.g., Make it formal and concise..."
              />
            </div>
          </div>
        </fieldset>
      ) : (
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
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Raw description</label>
              <textarea
                className="w-full rounded border px-3 py-2 text-sm border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                value={form.rawDescription}
                onChange={(e) => setForm({ ...form, rawDescription: e.target.value })}
                placeholder="Describe the event freely. Gemini will reorganise this."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Specific AI Instructions (Optional)</label>
              <textarea
                className="w-full rounded border px-3 py-2 text-sm border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="E.g., Make the tone more enthusiastic, or specifically highlight the Q&A session..."
              />
            </div>
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-4 border-t border-gray-100 pt-3">
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

      {form.docType !== "application" && (
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
      )}

      {isQuotaError && (
        <div className="rounded border border-amber-200 bg-amber-50 p-4 space-y-3">
          <h3 className="text-sm font-bold text-amber-800">API Limit Reached</h3>
          <p className="text-sm text-amber-700">
            The server&apos;s Gemini API key has run out of quota. To continue using AutoReport, please provide your own free Gemini API key.
          </p>
          <ol className="list-decimal list-inside text-sm text-amber-700 space-y-1">
            <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-amber-900">Google AI Studio</a>.</li>
            <li>Sign in and click <strong>Create API key</strong>.</li>
            <li>Paste your new key below and click Generate again.</li>
          </ol>
          <div>
            <label className="mb-1 block text-sm font-medium text-amber-900">Your Gemini API Key (Not Saved to Server)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm border-amber-300 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="AIzaSy..."
            />
          </div>
        </div>
      )}

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

      {error && !isQuotaError && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {displayError}
        </p>
      )}

      <fieldset className="space-y-4 border-t border-gray-200 pt-3">
        <legend className="text-base font-semibold text-ink">
          AI output (edit before download)
        </legend>
        
        {ai.sections.map((sec) => (
          <div key={sec.id} className="p-3 border border-gray-200 rounded-md bg-gray-50 flex flex-col gap-3 relative">
            <button 
              type="button" 
              onClick={() => setAi({...ai, sections: ai.sections.filter(s => s.id !== sec.id)})}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-semibold"
            >
              Remove
            </button>
            <div className="flex gap-2">
              <span className="font-semibold text-sm uppercase text-gray-500 w-16 pt-2">{sec.type}</span>
              <div className="flex-1">
                <Field
                  label="Heading"
                  value={sec.heading}
                  onChange={(e) => setAi({...ai, sections: ai.sections.map(s => s.id === sec.id ? {...s, heading: e.target.value} : s)})}
                />
              </div>
            </div>
            
            <div className="pl-18">
              {sec.type === "text" && (
                <TextArea
                  label="Text Content"
                  rows={4}
                  value={sec.text || ""}
                  onChange={(e) => setAi({...ai, sections: ai.sections.map(s => s.id === sec.id ? {...s, text: e.target.value} : s)})}
                />
              )}
              {sec.type === "bullets" && (
                <TextArea
                  label="Bullets (one per line)"
                  rows={4}
                  value={(sec.bullets || []).join("\\n")}
                  onChange={(e) => setAi({...ai, sections: ai.sections.map(s => s.id === sec.id ? {...s, bullets: e.target.value.split("\\n")} : s)})}
                />
              )}
              {sec.type === "table" && (
                <div className="text-sm text-gray-600 bg-white p-2 border rounded">
                  {sec.table?.map((row, r) => (
                    <div key={r} className="flex gap-2 mb-1 border-b pb-1">
                      {row.map((cell, c) => (
                        <input
                          key={c}
                          value={cell}
                          onChange={(e) => {
                            const newTable = [...(sec.table || [])];
                            newTable[r] = [...newTable[r]];
                            newTable[r][c] = e.target.value;
                            setAi({...ai, sections: ai.sections.map(s => s.id === sec.id ? {...s, table: newTable} : s)});
                          }}
                          className="flex-1 border px-2 py-1 rounded text-sm"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {sec.type === "image" && (
                <div className="text-sm font-medium text-gray-700">
                  Image placeholder for index: {sec.imageIndex}
                </div>
              )}
            </div>
          </div>
        ))}
      </fieldset>
    </form>
  );
}
