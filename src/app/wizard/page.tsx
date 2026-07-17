"use client";
import React, { useState, Suspense, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageDropzone, type LocalPhoto } from "@/frontend/ImageDropzone";
import { REPORT_DEFAULTS, SIGNATORIES } from "@/utils/constants";

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docType = (searchParams.get("type") || "report") as "report" | "application";

  // State Management
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [titleChoice, setTitleChoice] = useState<"manual" | "extract">("manual");
  const [date, setDate] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  });
  const [venue, setVenue] = useState("");
  const [participants, setParticipants] = useState("");
  const [highlights, setHighlights] = useState("");
  const [rawDescription, setRawDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [recipient, setRecipient] = useState("The Principal,\nDhole Patil College of Engineering,\nPune.");
  const [senderName, setSenderName] = useState("");
  const [senderDesignation, setSenderDesignation] = useState("Student, Department of AI & ML");
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Preparing draft...");
  const [error, setError] = useState<string | null>(null);

  // Dynamic step definitions: one thing at a time
  const steps = useMemo(() => {
    if (docType === "report") {
      return [
        { id: "title", label: "What is the title of the event?", description: "Enter the title manually, or let Gemini extract it from your description later." },
        { id: "date", label: "When was this event held?", description: "Select the date of the event." },
        { id: "venue", label: "Where was this event hosted?", description: "e.g. Seminar Hall, A-Block, Computer Lab" },
        { id: "participants", label: "Who participated in the event?", description: "e.g. BE students, department faculty, external speakers" },
        { id: "highlights", label: "What were the key takeaways / highlights?", description: "List bullet points or rough notes on the main highlights." },
        { id: "rawDescription", label: "Give a raw description of the event", description: "Mandatory: Describe the event details freely in your own words. AI will formalize this." },
        { id: "instructions", label: "Any specific formatting instructions?", description: "Optional: e.g. Keep it concise, highlight the key speaker." },
        { id: "photos", label: "Upload photographs of the event", description: "Optional: Drag and drop event photographs." }
      ];
    } else {
      return [
        { id: "title", label: "What is the subject of the application?", description: "Enter the subject header of your request." },
        { id: "recipient", label: "Who is this application addressed to?", description: "Enter the designation and address of the authority." },
        { id: "date", label: "Select the application date", description: "The date listed on the header of the letter." },
        { id: "senderName", label: "What is your full name?", description: "Enter the sender name." },
        { id: "senderDesignation", label: "What is your designation / department?", description: "e.g. President, AI & ML Club" },
        { id: "highlights", label: "What are the main request points?", description: "List bullet points of details or requests." },
        { id: "rawDescription", label: "Give a description of the request details", description: "Mandatory: Describe the application requirements freely." },
        { id: "instructions", label: "Any specific instructions for the AI?", description: "Optional: e.g. Keep it formal and polite." }
      ];
    }
  }, [docType]);

  const totalSteps = steps.length;
  const currentStep = steps[step - 1];

  // Helper to check if current step input is empty
  const isCurrentFieldEmpty = useMemo(() => {
    const id = currentStep.id;
    // rawDescription is mandatory so we do not count it as empty (which would show the "Draft with Gemini" skip option)
    if (id === "rawDescription") return false;
    
    if (id === "title") return titleChoice === "extract" ? true : title.trim() === "";
    if (id === "recipient") return recipient.trim() === "";
    if (id === "date") return date.trim() === "";
    if (id === "venue") return venue.trim() === "";
    if (id === "participants") return participants.trim() === "";
    if (id === "senderName") return senderName.trim() === "";
    if (id === "senderDesignation") return senderDesignation.trim() === "";
    if (id === "highlights") return highlights.trim() === "";
    if (id === "instructions") return instructions.trim() === "";
    if (id === "photos") return photos.length === 0;
    return true;
  }, [currentStep, title, titleChoice, recipient, date, venue, participants, senderName, senderDesignation, highlights, instructions, photos]);

  const handleNextClick = () => {
    if (currentStep.id === "rawDescription" && rawDescription.trim() === "") {
      return; // Mandated raw description cannot be empty
    }

    if (isCurrentFieldEmpty) {
      // Act as skip/generate immediately
      handleSubmit();
    } else {
      // Proceed to next step
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const statuses = [
      "Analyzing inputs...",
      "Consulting college templates...",
      "Drafting official narrative...",
      "Polishing structure...",
      "Finalizing formatting..."
    ];

    let statusIndex = 0;
    const interval = setInterval(() => {
      if (statusIndex < statuses.length - 1) {
        statusIndex++;
        setLoadingStatus(statuses[statusIndex]);
      }
    }, 2000);

    try {
      const fd = new FormData();
      fd.append(
        "meta",
        JSON.stringify({
          title: titleChoice === "extract" ? "" : title,
          date,
          venue: docType === "report" ? venue : "",
          participants: docType === "report" ? participants : "",
          highlights,
          rawDescription,
          instructions,
          photoCaptions: photos.map((p) => p.caption),
          docType,
          recipient: docType === "application" ? recipient : undefined,
          senderName: docType === "application" ? senderName : undefined,
          senderDesignation: docType === "application" ? senderDesignation : undefined,
        })
      );
      photos.forEach((p) => fd.append("photos", p.file, p.file.name));

      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const json = await res.json();
      
      clearInterval(interval);

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Generation failed");
      }

      // Save to localStorage to transfer state to editor page
      localStorage.setItem("auto_draft_ai_state", JSON.stringify(json.data));
      localStorage.setItem(
        "auto_draft_form_state",
        JSON.stringify({
          title: json.data.generatedTitle || title,
          date,
          venue,
          participants,
          highlights,
          rawDescription,
          instructions,
          academicYear: REPORT_DEFAULTS.academicYear,
          semester: REPORT_DEFAULTS.semester,
          acaRNo: REPORT_DEFAULTS.acaRNo,
          revNo: REPORT_DEFAULTS.revNo,
          advisor: SIGNATORIES.advisor,
          sdpHead: SIGNATORIES.sdpHead,
          principal: SIGNATORIES.principal,
          docType,
          recipient,
          senderName,
          senderDesignation,
        })
      );

      // Serialize photos for localStorage
      const photoPromises = photos.map(async (p) => ({
        id: p.id,
        name: p.file.name,
        type: p.file.type,
        dataUrl: p.dataUrl,
        caption: p.caption,
      }));
      const serializedPhotos = await Promise.all(photoPromises);
      localStorage.setItem("auto_draft_photos", JSON.stringify(serializedPhotos));

      router.push("/editor");
    } catch (e) {
      clearInterval(interval);
      setError(e instanceof Error ? e.message : "Failed to draft document");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12">
      {loading && (
        <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <Image
            src="/logo.svg"
            alt="DPES Logo"
            width={120}
            height={100}
            className="h-24 w-auto mb-8 animate-pulse"
          />
          <div className="w-64 bg-gray-200 h-1.5 rounded-full overflow-hidden mb-4">
            <div className="bg-blue-600 h-full rounded-full animate-progress" style={{ width: "60%" }}></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Drafting Document</h3>
          <p className="text-gray-500 font-medium text-sm">{loadingStatus}</p>
        </div>
      )}

      <div className="w-full max-w-xl relative flex flex-col justify-center">
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">{currentStep.label}</h2>
            <p className="text-sm text-gray-400 mt-2 font-medium">{currentStep.description}</p>
          </div>

          {/* Form input render - simplified Typeform style */}
          <div className="min-h-[140px] flex flex-col justify-start pt-2">
            {currentStep.id === "title" && (
              <div className="space-y-4 w-full">
                <input
                  type="text"
                  autoFocus
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                  value={titleChoice === "extract" && docType === "report" ? "" : title}
                  disabled={titleChoice === "extract" && docType === "report"}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleChoice("manual");
                  }}
                  placeholder={
                    titleChoice === "extract" && docType === "report"
                      ? "Gemini will auto-generate..."
                      : "Type title here..."
                  }
                />
                {docType === "report" && (
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
                    className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      titleChoice === "extract"
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {titleChoice === "extract" ? "✓ Gemini Enabled" : "Draft Title with Gemini"}
                  </button>
                )}
              </div>
            )}

            {currentStep.id === "recipient" && (
              <textarea
                rows={3}
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-2 text-xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300 resize-none"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Address recipient here..."
              />
            )}

            {currentStep.id === "date" && (
              <input
                type="date"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            )}

            {currentStep.id === "venue" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Seminar Hall, A-Block"
              />
            )}

            {currentStep.id === "participants" && (
              <textarea
                rows={2}
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-2 text-xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300 resize-none"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="e.g. TE & BE students..."
              />
            )}

            {currentStep.id === "senderName" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name..."
              />
            )}

            {currentStep.id === "senderDesignation" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={senderDesignation}
                onChange={(e) => setSenderDesignation(e.target.value)}
                placeholder="e.g. Student, AI & ML Club"
              />
            )}

            {currentStep.id === "highlights" && (
              <textarea
                rows={3}
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-2 text-xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300 resize-none"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Type key bullet points..."
              />
            )}

            {currentStep.id === "rawDescription" && (
              <textarea
                rows={4}
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-2 text-lg font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300 resize-none"
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                placeholder="Describe details here..."
              />
            )}

            {currentStep.id === "instructions" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Specific directions..."
              />
            )}

            {currentStep.id === "photos" && (
              <div className="w-full scale-95 origin-top">
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
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 pt-6 border-t border-gray-150 flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-black transition-colors uppercase tracking-wider"
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={handleNextClick}
            disabled={currentStep.id === "rawDescription" && rawDescription.trim() === ""}
            className={`px-8 py-2.5 text-sm font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] ${
              currentStep.id === "rawDescription" && rawDescription.trim() === ""
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            {currentStep.id === "rawDescription"
              ? step === totalSteps
                ? "Finish & Draft"
                : "Next"
              : isCurrentFieldEmpty
              ? "Draft with Gemini"
              : step === totalSteps
              ? "Finish & Draft"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 font-semibold">Loading questions...</div>}>
      <WizardContent />
    </Suspense>
  );
}
