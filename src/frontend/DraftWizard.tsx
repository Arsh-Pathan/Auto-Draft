"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ImageDropzone, type LocalPhoto } from "./ImageDropzone";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    docType: "report" | "application";
    title: string;
    date: string;
    venue: string;
    participants: string;
    highlights: string;
    rawDescription: string;
    instructions: string;
    recipient: string;
    senderName: string;
    senderDesignation: string;
    titleChoice: "manual" | "extract";
  }) => void;
  photos: LocalPhoto[];
  setPhotos: (p: LocalPhoto[]) => void;
  initialDocType?: "report" | "application";
};

export function DraftWizard({ isOpen, onClose, onComplete, photos, setPhotos, initialDocType }: Props) {
  const [docType, setDocType] = useState<"report" | "application">(initialDocType || "report");
  
  // Guided state fields
  const [titleChoice, setTitleChoice] = useState<"manual" | "extract">("manual");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  });
  const [venue, setVenue] = useState("");
  const [participants, setParticipants] = useState("");
  const recipient = "The Principal,\nDhole Patil College of Engineering,\nPune.";
  const senderName = "";
  const senderDesignation = "Student, Department of AI & ML";
  const [rawDescription, setRawDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [instructions, setInstructions] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawDescription.trim()) {
      setValidationError("Please enter your rough notes or description.");
      return;
    }
    setValidationError(null);
    onComplete({
      docType,
      title: titleChoice === "extract" ? "extract" : title,
      date,
      venue,
      participants,
      highlights,
      rawDescription,
      instructions,
      recipient,
      senderName,
      senderDesignation,
      titleChoice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-extrabold text-gray-900">Document Quick Draft</h2>
          <p className="mt-1 text-xs text-gray-500">Fill in all details on this screen. Gemini will generate the document format automatically.</p>
        </div>

        {validationError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Format Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Document Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDocType("report")}
                className={`p-3.5 rounded-xl border text-left font-bold text-sm transition-all ${
                  docType === "report"
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/20"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Activity Report
              </button>
              <button
                type="button"
                onClick={() => setDocType("application")}
                className={`p-3.5 rounded-xl border text-left font-bold text-sm transition-all ${
                  docType === "application"
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/20"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Official Application
              </button>
            </div>
          </div>

          {/* Form Fields */}
          {docType === "application" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Application Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Permission request for granting duty attendance"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Arsh Pathan"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={titleChoice === "extract" ? "" : title}
                  disabled={titleChoice === "extract"}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleChoice("manual");
                  }}
                  placeholder={titleChoice === "extract" ? "Gemini will extract title..." : "e.g. PyTorch Hands-On Workshop"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Seminar Hall"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Participants</label>
                <input
                  type="text"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="TE & BE students"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Narrative & Notes */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rough Notes / Narrative *</label>
              <textarea
                rows={3}
                required
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                placeholder="Write what happened or what you are requesting. Gemini will draft this into formal text."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Highlights (Optional)</label>
              <input
                type="text"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Quick bullet points..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Special AI Instructions (Optional)</label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Specific tone or formatting instructions..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Photos for Report */}
          {docType === "report" && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Photographs (Optional)</label>
              <ImageDropzone
                photos={photos}
                onAdd={(added) => setPhotos([...photos, ...added])}
                onRemove={(id) => setPhotos(photos.filter((p) => p.id !== id))}
                onCaption={(id, caption) =>
                  setPhotos(photos.map((p) => (p.id === id ? { ...p, caption } : p)))
                }
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit">
              Finish & Draft with Gemini
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
