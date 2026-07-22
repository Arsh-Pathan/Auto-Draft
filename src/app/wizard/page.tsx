"use client";
import React, { useState, Suspense, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageDropzone, type LocalPhoto } from "@/frontend/ImageDropzone";
import { REPORT_DEFAULTS, SIGNATORIES } from "@/utils/constants";
import type { DocType } from "@/types/report";

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docType = (searchParams.get("type") || "report") as DocType;

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
  
  // Closing Meeting specific state
  const [organizedBy, setOrganizedBy] = useState("AI & ML Club");
  const [facultyCoordinator, setFacultyCoordinator] = useState("");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("04:00 PM");
  const [duration, setDuration] = useState("6 Hours");

  // Project Proposal specific state
  const [projectTrack, setProjectTrack] = useState("Software Track");
  const [teamStructure, setTeamStructure] = useState("");
  const [techStack, setTechStack] = useState("");
  const [totalFinancialRequest, setTotalFinancialRequest] = useState("₹ 0 (Self-funded / Software)");
  const [hardwareSourcing, setHardwareSourcing] = useState("Innovation Lab Stock / Local Vendors");
  const [labAccess, setLabAccess] = useState("3D Printing Workshop & Circuit Testing");
  const [architectureLink, setArchitectureLink] = useState("");
  const [sensorDiagramLink, setSensorDiagramLink] = useState("");
  const [videoLinks, setVideoLinks] = useState("");
  const [paperLinks, setPaperLinks] = useState("");

  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Preparing draft...");
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");

  React.useEffect(() => {
    const savedKey = localStorage.getItem("auto_draft_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Dynamic step definitions: comprehensive and tailored per document type
  const steps = useMemo(() => {
    if (docType === "closing_meeting") {
      return [
        { id: "title", label: "What is the event title?", description: "Enter the formal title of the completed event." },
        { id: "organizedBy", label: "Who organized this event?", description: "e.g. AI & ML Club / SDP Department" },
        { id: "facultyCoordinator", label: "Who was the faculty coordinator?", description: "Enter the name of the faculty in charge." },
        { id: "date", label: "What was the event date?", description: "Select the date the event took place." },
        { id: "venue", label: "Where was it held?", description: "e.g. Seminar Hall, Computer Lab 3" },
        { id: "timing", label: "What were the event timings & duration?", description: "e.g. Start 10:00 AM, End 4:00 PM, Duration 6 Hours" },
        { id: "participants", label: "How many & who participated?", description: "e.g. 85 Students from TE & BE AI & ML" },
        { id: "highlights", label: "What were key challenges or recommendations?", description: "List bullet points of challenges faced and team suggestions." },
        { id: "photos", label: "Upload event & meeting photos", description: "Upload photographs taken during the session." },
        { id: "rawDescription", label: "Brief summary of what happened?", description: "Mandatory: Write a summary of the meeting and event conduction." },
        { id: "instructions", label: "Any special instructions for Gemini?", description: "Optional directions for report generation." }
      ];
    } else if (docType === "project_proposal") {
      return [
        { id: "title", label: "What is your project title?", description: "Enter the full professional title of your proposed project." },
        { id: "projectTrack", label: "What is the project track?", description: "e.g. Hardware Track / Software Track / AI System" },
        { id: "senderName", label: "Who is the primary applicant & lead?", description: "Enter your full name." },
        { id: "teamStructure", label: "What is the team structure?", description: "e.g. Arsh Pathan & Vedika Pathode (Dept of AI & ML)" },
        { id: "techStack", label: "What target tech stack & sensors are used?", description: "e.g. Python, PyTorch, ESP32 microcontrollers, OpenCV" },
        { id: "totalFinancialRequest", label: "What is your budgetary request?", description: "e.g. ₹ 2,500 for sensors/components, or ₹ 0 for software" },
        { id: "hardwareSourcing", label: "What is your hardware sourcing strategy?", description: "e.g. Innovation Lab Stock / Local Vendors / Self-funded" },
        { id: "labAccess", label: "What lab access or 3D printing is required?", description: "e.g. 3D printing enclosure slot, PCB soldering station" },
        { id: "referenceLinks", label: "Provide reference links & diagrams", description: "Links to Architecture Blueprint, Sensor Pinouts, Video Demos & Papers." },
        { id: "rawDescription", label: "Describe the project concept & architecture", description: "Mandatory: 2-3 sentences explaining what you are building and why." },
        { id: "instructions", label: "Any special instructions for Gemini?", description: "Optional directions for proposal drafting." }
      ];
    } else if (docType === "report") {
      return [
        { id: "title", label: "What is the title of the event?", description: "Enter the title manually, or let Gemini extract it from your description later." },
        { id: "date", label: "When was the event held?", description: "Select the date of the event." },
        { id: "venue", label: "Where did it take place?", description: "e.g. Seminar Hall, A-Block, Computer Lab" },
        { id: "participants", label: "Who attended the event?", description: "e.g. BE students, department faculty, guest speakers" },
        { id: "highlights", label: "What were the key highlights?", description: "List some quick bullet points or takeaways." },
        { id: "photos", label: "Upload event photos", description: "Upload event photographs with optional captions." },
        { id: "rawDescription", label: "Roughly what happened?", description: "Mandatory: Write in simple words what happened from start to finish." },
        { id: "instructions", label: "Any special instructions for Gemini?", description: "Optional: e.g. Keep it concise, highlight the guest speaker's speech." }
      ];
    } else {
      return [
        { id: "title", label: "What is the subject of the application?", description: "Enter the subject header of your request." },
        { id: "recipient", label: "Who is receiving this application?", description: "Enter the designation and address of the authority." },
        { id: "date", label: "What is the date?", description: "Select the application date." },
        { id: "senderName", label: "What is your name?", description: "Enter your full name." },
        { id: "senderDesignation", label: "What is your designation or department?", description: "e.g. Student, Department of AI & ML" },
        { id: "highlights", label: "What are the key points of the request?", description: "List bullet points of details or requests." },
        { id: "rawDescription", label: "Roughly what is this request about?", description: "Mandatory: Describe why you are making this request and the details." },
        { id: "instructions", label: "Any special instructions for Gemini?", description: "Optional: e.g. Keep it formal and polite." }
      ];
    }
  }, [docType]);

  const totalSteps = steps.length;
  const currentStep = steps[step - 1];

  // Helper to check if current step input is empty
  const isCurrentFieldEmpty = useMemo(() => {
    const id = currentStep.id;
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
    if (id === "organizedBy") return organizedBy.trim() === "";
    if (id === "facultyCoordinator") return facultyCoordinator.trim() === "";
    if (id === "timing") return startTime.trim() === "";
    if (id === "projectTrack") return projectTrack.trim() === "";
    if (id === "teamStructure") return teamStructure.trim() === "";
    if (id === "techStack") return techStack.trim() === "";
    if (id === "totalFinancialRequest") return totalFinancialRequest.trim() === "";
    if (id === "photos") return photos.length === 0;
    return true;
  }, [currentStep, title, titleChoice, recipient, date, venue, participants, senderName, senderDesignation, highlights, instructions, organizedBy, facultyCoordinator, startTime, projectTrack, teamStructure, techStack, totalFinancialRequest, photos]);

  const handleNextClick = () => {
    if (currentStep.id === "rawDescription" && rawDescription.trim() === "") {
      return; // Mandated raw description cannot be empty
    }

    if (currentStep.id === "title" && title.trim() === "") {
      // User clicked "Draft with Gemini" on the Title step.
      // We set it to auto-extract and proceed to the next step rather than generating the whole document.
      setTitleChoice("extract");
      setStep(step + 1);
      return;
    }

    if (isCurrentFieldEmpty) {
      // User clicked "Draft with Gemini" to skip/fast-track.
      // If we are before the rawDescription step, jump directly to it to collect the mandatory raw notes.
      const rawDescIndex = steps.findIndex((s) => s.id === "rawDescription");
      if (step - 1 < rawDescIndex) {
        setStep(rawDescIndex + 1);
      } else {
        handleSubmit();
      }
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
          venue,
          participants,
          highlights,
          rawDescription,
          instructions,
          photoCaptions: photos.map((p) => p.caption),
          docType,
          apiKey: apiKey || undefined,
          recipient: docType === "application" ? recipient : undefined,
          senderName,
          senderDesignation,
          organizedBy,
          facultyCoordinator,
          startTime,
          endTime,
          duration,
          projectTrack,
          teamStructure,
          techStack,
          totalFinancialRequest,
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
          technicalLead: SIGNATORIES.technicalLead,
          docType,
          recipient,
          senderName,
          senderDesignation,
          organizedBy,
          facultyCoordinator,
          startTime,
          endTime,
          duration,
          projectTrack,
          teamStructure,
          techStack,
          totalFinancialRequest,
          hardwareSourcing,
          labAccess,
          architectureLink,
          sensorDiagramLink,
          videoLinks,
          paperLinks,
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
        {error && (error.includes("GEMINI_API_KEY") || error.toLowerCase().includes("quota") || error.includes("API key")) ? (
          <div className="mb-6 p-6 rounded-xl border border-amber-200 bg-amber-50/50 space-y-4">
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Gemini API Key Required</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              The server&apos;s Gemini API key is missing or has exceeded its limit. Please provide your own free Gemini API key to continue. You can get one from{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900 hover:opacity-80">
                Google AI Studio
              </a>.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                localStorage.setItem("auto_draft_api_key", e.target.value);
              }}
              className="w-full bg-transparent border-b border-amber-300 py-2 text-sm font-medium focus:border-amber-600 focus:outline-none transition-colors placeholder-amber-400"
              placeholder="Paste your API key (AIzaSy...) here"
            />
          </div>
        ) : error ? (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 font-medium">
            {error}
          </div>
        ) : null}

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">{currentStep.label}</h2>
            <p className="text-sm text-gray-400 mt-2 font-medium">{currentStep.description}</p>
          </div>

          {/* Form input render - simplified Typeform style */}
          <div className="min-h-[140px] flex flex-col justify-start pt-2">
            {currentStep.id === "title" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={titleChoice === "extract" ? "" : title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleChoice("manual");
                }}
                placeholder="Type title here..."
              />
            )}

            {currentStep.id === "organizedBy" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={organizedBy}
                onChange={(e) => setOrganizedBy(e.target.value)}
                placeholder="e.g. AI & ML Club"
              />
            )}

            {currentStep.id === "facultyCoordinator" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={facultyCoordinator}
                onChange={(e) => setFacultyCoordinator(e.target.value)}
                placeholder="e.g. Prof. Yugashree Pawar"
              />
            )}

            {currentStep.id === "timing" && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400">Start Time</label>
                  <input
                    type="text"
                    className="w-full bg-transparent border-b border-gray-300 py-2 text-lg font-medium focus:border-black focus:outline-none"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400">End Time</label>
                  <input
                    type="text"
                    className="w-full bg-transparent border-b border-gray-300 py-2 text-lg font-medium focus:border-black focus:outline-none"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400">Duration</label>
                  <input
                    type="text"
                    className="w-full bg-transparent border-b border-gray-300 py-2 text-lg font-medium focus:border-black focus:outline-none"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep.id === "projectTrack" && (
              <select
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none"
                value={projectTrack}
                onChange={(e) => setProjectTrack(e.target.value)}
              >
                <option value="Software Track">Software Track</option>
                <option value="Hardware Track">Hardware Track</option>
                <option value="AI / ML System Track">AI / ML System Track</option>
                <option value="Embedded Systems Track">Embedded Systems Track</option>
              </select>
            )}

            {currentStep.id === "teamStructure" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={teamStructure}
                onChange={(e) => setTeamStructure(e.target.value)}
                placeholder="e.g. Arsh Pathan & Vedika Pathode (Dept of AI & ML)"
              />
            )}

            {currentStep.id === "techStack" && (
              <textarea
                rows={3}
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-2 text-xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300 resize-none"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g. Python, PyTorch, React, ESP32 microcontrollers..."
              />
            )}

            {currentStep.id === "totalFinancialRequest" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={totalFinancialRequest}
                onChange={(e) => setTotalFinancialRequest(e.target.value)}
                placeholder="e.g. ₹ 2,500 or ₹ 0"
              />
            )}

            {currentStep.id === "hardwareSourcing" && (
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-3 text-xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                value={hardwareSourcing}
                onChange={(e) => setHardwareSourcing(e.target.value)}
                placeholder="e.g. Innovation Lab Stock / Local Vendors / Self-funded"
              />
            )}

            {currentStep.id === "labAccess" && (
              <textarea
                rows={3}
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 py-2 text-xl font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300 resize-none"
                value={labAccess}
                onChange={(e) => setLabAccess(e.target.value)}
                placeholder="e.g. 3D printing enclosure slot, PCB soldering station..."
              />
            )}

            {currentStep.id === "referenceLinks" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Architecture Blueprint / Diagram Link</label>
                  <input
                    type="url"
                    className="w-full bg-transparent border-b border-gray-300 py-2 text-sm font-medium focus:border-black focus:outline-none placeholder-gray-400"
                    value={architectureLink}
                    onChange={(e) => setArchitectureLink(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/.../architecture.png"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Sensor Pinout / Schematic Link</label>
                  <input
                    type="url"
                    className="w-full bg-transparent border-b border-gray-300 py-2 text-sm font-medium focus:border-black focus:outline-none placeholder-gray-400"
                    value={sensorDiagramLink}
                    onChange={(e) => setSensorDiagramLink(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/.../schematic.png"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Video Demo / Implementation Link</label>
                  <input
                    type="url"
                    className="w-full bg-transparent border-b border-gray-300 py-2 text-sm font-medium focus:border-black focus:outline-none placeholder-gray-400"
                    value={videoLinks}
                    onChange={(e) => setVideoLinks(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Academic Paper / IEEE Reference Link</label>
                  <input
                    type="url"
                    className="w-full bg-transparent border-b border-gray-300 py-2 text-sm font-medium focus:border-black focus:outline-none placeholder-gray-400"
                    value={paperLinks}
                    onChange={(e) => setPaperLinks(e.target.value)}
                    placeholder="https://arxiv.org/abs/..."
                  />
                </div>
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
                placeholder="Type what roughly happened here..."
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
