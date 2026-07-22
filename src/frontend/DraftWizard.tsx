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
  const [step, setStep] = useState(initialDocType ? 2 : 1);
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
  const [recipient, setRecipient] = useState("The Principal,");
  const [senderName, setSenderName] = useState("");
  const [senderDesignation, setSenderDesignation] = useState("Student, Department of AI & ML");
  const [rawDescription, setRawDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [instructions, setInstructions] = useState("");

  if (!isOpen) return null;

  const totalSteps = docType === "report" ? 5 : 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
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
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl transition-all md:p-8">
        
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

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
            <span>Step {step} of {totalSteps}</span>
            <span className="font-bold text-blue-600">Draft Wizard</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Select Format */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">What would you like to draft today?</h2>
              <p className="mt-1 text-sm text-gray-500">Select the official college document format below to begin.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                onClick={() => setDocType("report")}
                className={`group cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                  docType === "report"
                    ? "border-blue-600 bg-blue-50/40"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Activity Report</h3>
                <p className="mt-1 text-xs text-gray-500">Official AI & ML Club event layout containing structured overview, bullets, schedule tables, photographs, and signatories.</p>
              </div>

              <div
                onClick={() => setDocType("application")}
                className={`group cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                  docType === "application"
                    ? "border-blue-600 bg-blue-50/40"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Official Application</h3>
                <p className="mt-1 text-xs text-gray-500">Official letter format addressed to DPCOE authorities (Leave Request, Permissions, Facility Bookings) with custom sender/recipient.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Subject & Recipient (Application) OR Title Choice (Report) */}
        {step === 2 && (
          <div className="space-y-5">
            {docType === "report" ? (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Report Title Selection</h2>
                  <p className="mt-1 text-sm text-gray-500">Enter the title manually or click to let Gemini auto-generate it.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Report Title</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={titleChoice === "extract" ? "" : title}
                      disabled={titleChoice === "extract"}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setTitleChoice("manual");
                      }}
                      placeholder={titleChoice === "extract" ? "Gemini will automatically generate a fitting title..." : "e.g. PyTorch Hands-On Workshop Report"}
                    />
                    {titleChoice === "extract" && (
                      <p className="mt-1.5 text-xs text-blue-600 font-medium animate-pulse">
                        Gemini will automatically generate a fitting title based on your description at the end.
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Letter Headers</h2>
                  <p className="mt-1 text-sm text-gray-500">Who is receiving this letter and what is it about?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Addressed To (Recipient)</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. The HOD,&#10;Department of Computer Engineering,&#10;DPCOE"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Application Subject / Title</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Request for seminar hall booking permission"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3: Metadata (Report) OR Sender Details (Application) */}
        {step === 3 && (
          <div className="space-y-5">
            {docType === "report" ? (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
                  <p className="mt-1 text-sm text-gray-500">Provide the basic context of when and where the event occurred.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Event Date</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Event Venue</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Semianr Hall / Lab 4"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Participants</label>
                  <textarea
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="e.g. TE & BE students of Comp/IT, faculty members..."
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Sender Details & Date</h2>
                  <p className="mt-1 text-sm text-gray-500">Who is writing this application request?</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Sender Name</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. Arsh Pathan"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Application Date</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Sender Designation / Roll No / Club Designation</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                      value={senderDesignation}
                      onChange={(e) => setSenderDesignation(e.target.value)}
                      placeholder="e.g. BE Student, Roll No: 42 / President, AI & ML Club"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 4: Raw notes & instructions (Both) */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Narrative & Rough Notes</h2>
              <p className="mt-1 text-sm text-gray-500">Enter your rough notes. Gemini will draft this into formal text.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Raw Description / Event Timeline</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                placeholder="Write freely. e.g. We need to book seminar hall on friday for AI & ML club guest lecture from 2pm to 4pm. Prof. Mane will give a guest speech. We need projector."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Highlights / Specific Notes (Optional)</label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="e.g. 50+ students expected, guest speaker is industry expert"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Specific AI Instructions (Optional)</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Keep the letter concise and polite, or highlight the budget estimation."
              />
            </div>
          </div>
        )}

        {/* STEP 5: Photograph Upload (Reports Only) */}
        {step === 5 && docType === "report" && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Upload Event Photographs</h2>
              <p className="mt-1 text-sm text-gray-500">Optional: Drag or drop photographs. Gemini will describe them automatically.</p>
            </div>

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

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={step === (initialDocType ? 2 : 1)}
          >
            Back
          </Button>

          <div className="flex gap-2">
            {step === 2 && docType === "report" && (
              <button
                type="button"
                onClick={() => {
                  if (titleChoice === "extract") {
                    setTitleChoice("manual");
                    setTitle("");
                  } else {
                    setTitleChoice("extract");
                    setTitle("");
                  }
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${
                  titleChoice === "extract"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                }`}
              >
                {titleChoice === "extract" ? "✓ Gemini Enabled" : "Draft with Gemini"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Wizard
            </button>
            <Button type="button" onClick={handleNext}>
              {step === totalSteps ? "Finish & Draft" : "Next"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
