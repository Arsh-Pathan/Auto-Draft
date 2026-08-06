"use client";
import React, { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageDropzone, type LocalPhoto } from "@/frontend/ImageDropzone";
import { REPORT_DEFAULTS, SIGNATORIES } from "@/utils/constants";
import type { DocType } from "@/types/report";

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDocType = (searchParams.get("type") || "report") as DocType;

  // Document Type State
  const [docType, setDocType] = useState<DocType>(initialDocType);

  // Form State Fields
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rawDescription.trim()) {
      setError("Please enter a brief description or notes to generate the document.");
      return;
    }

    setLoading(true);
    setError(null);

    const statuses = [
      "Analyzing inputs...",
      "Consulting official college templates...",
      "Drafting formal document narrative...",
      "Polishing structural alignment...",
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
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Loading Overlay */}
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
          <h3 className="text-xl font-bold text-gray-900 mb-1">Drafting Document with Gemini</h3>
          <p className="text-gray-500 font-medium text-sm">{loadingStatus}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> All-in-One Generator
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Create Document</h1>
            <p className="text-sm text-gray-500 mt-1">Fill out the details below in one place. Gemini will generate a polished, formal document.</p>
          </div>
          
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3.5 py-2 hover:bg-gray-50 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* API Key Banner if Error */}
        {error && (error.includes("GEMINI_API_KEY") || error.toLowerCase().includes("quota") || error.includes("API key")) && (
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/80 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Gemini API Key Required</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              The server&apos;s API key is missing or quota has been reached. Enter your free Gemini API key below:
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                localStorage.setItem("auto_draft_api_key", e.target.value);
              }}
              className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-amber-600 focus:outline-none placeholder-amber-400"
              placeholder="Paste your API key (AIzaSy...) here"
            />
          </div>
        )}

        {error && !error.includes("API key") && !error.includes("GEMINI_API_KEY") && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Document Type Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "report", label: "Activity Report", desc: "Events & Workshops" },
            { id: "application", label: "Official Application", desc: "Leave & Permissions" },
            { id: "closing_meeting", label: "Closing Meeting", desc: "Event Post-Mortem" },
            { id: "project_proposal", label: "Project Proposal", desc: "Hardware & Tech Stack" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDocType(item.id as DocType)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                docType === item.id
                  ? "border-blue-600 bg-blue-600 text-white shadow-md ring-2 ring-blue-600/20"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <div>
                <div className="font-bold text-sm leading-tight">{item.label}</div>
                <div className={`text-xs mt-1 ${docType === item.id ? "text-blue-100" : "text-gray-400"}`}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Single Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-6">

          {/* DOCUMENT-SPECIFIC INPUT SECTIONS */}
          {docType === "application" ? (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                Application Header Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Application Subject / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Permission request for granting duty attendance for AI & ML Club representation"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Sender Full Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Arsh Pathan"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Application Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Sender Designation / Roll No / Department</label>
                  <input
                    type="text"
                    value={senderDesignation}
                    onChange={(e) => setSenderDesignation(e.target.value)}
                    placeholder="e.g. Student, Department of AI & ML"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Addressed To (Recipient)</label>
                  <textarea
                    rows={3}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. The Principal,&#10;Dhole Patil College of Engineering, Pune."
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          ) : docType === "closing_meeting" ? (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                Closing Meeting Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. SDP AI & ML Workshop Closing Meeting"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Organized By</label>
                  <input
                    type="text"
                    value={organizedBy}
                    onChange={(e) => setOrganizedBy(e.target.value)}
                    placeholder="e.g. AI & ML Club"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Faculty Coordinator</label>
                  <input
                    type="text"
                    value={facultyCoordinator}
                    onChange={(e) => setFacultyCoordinator(e.target.value)}
                    placeholder="e.g. Prof. Yugashree Pawar"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Seminar Hall, A-Block"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">End Time</label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Participants</label>
                  <input
                    type="text"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="e.g. 85 Students & 4 Faculty Members"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : docType === "project_proposal" ? (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                Project Proposal Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Autonomous Campus Drone System"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Project Track</label>
                  <select
                    value={projectTrack}
                    onChange={(e) => setProjectTrack(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none bg-white"
                  >
                    <option value="Software Track">Software Track</option>
                    <option value="Hardware Track">Hardware Track</option>
                    <option value="AI / ML System Track">AI / ML System Track</option>
                    <option value="Embedded Systems Track">Embedded Systems Track</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Proposal Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Lead Applicant Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Arsh Pathan"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Team Structure</label>
                  <input
                    type="text"
                    value={teamStructure}
                    onChange={(e) => setTeamStructure(e.target.value)}
                    placeholder="e.g. Arsh Pathan & Vedika Pathode (Dept of AI & ML)"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Target Tech Stack & Microcontrollers</label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="Python, PyTorch, ESP32 microcontrollers, OpenCV"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Total Financial Request (₹)</label>
                  <input
                    type="text"
                    value={totalFinancialRequest}
                    onChange={(e) => setTotalFinancialRequest(e.target.value)}
                    placeholder="₹ 2,500 or ₹ 0"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Hardware Sourcing</label>
                  <input
                    type="text"
                    value={hardwareSourcing}
                    onChange={(e) => setHardwareSourcing(e.target.value)}
                    placeholder="Innovation Lab Stock / Local Vendors"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Lab Access Requirements</label>
                  <input
                    type="text"
                    value={labAccess}
                    onChange={(e) => setLabAccess(e.target.value)}
                    placeholder="3D Printing Workshop & Circuit Testing"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Technical Reference Links (Optional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="url"
                      value={architectureLink}
                      onChange={(e) => setArchitectureLink(e.target.value)}
                      placeholder="Architecture Diagram URL (https://...)"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={sensorDiagramLink}
                      onChange={(e) => setSensorDiagramLink(e.target.value)}
                      placeholder="Sensor Pinout URL (https://...)"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={videoLinks}
                      onChange={(e) => setVideoLinks(e.target.value)}
                      placeholder="Video Demo URL (https://...)"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={paperLinks}
                      onChange={(e) => setPaperLinks(e.target.value)}
                      placeholder="Academic Paper URL (https://...)"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                Activity Report Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Report Title
                    </label>
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
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                        titleChoice === "extract"
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {titleChoice === "extract" ? "Gemini Auto-Generate Title" : "Auto-Generate with Gemini"}
                    </button>
                  </div>
                  <input
                    type="text"
                    disabled={titleChoice === "extract"}
                    value={titleChoice === "extract" ? "" : title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setTitleChoice("manual");
                    }}
                    placeholder={titleChoice === "extract" ? "Gemini will automatically generate a fitting title..." : "e.g. Hands-On PyTorch Workshop"}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Seminar Hall, A-Block"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Participants</label>
                  <input
                    type="text"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="e.g. TE & BE students, faculty members..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMMON NARRATIVE & ROUGH NOTES SECTION */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Description & Rough Notes
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Rough Notes / Narrative <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                placeholder="Write freely in simple words what this document is about, what happened, or what you are requesting. Gemini will structure this into formal academic text."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Highlights / Specific Points (Optional)</label>
              <textarea
                rows={2}
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Bullet points of specific highlights, challenges, or key takeaways..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Special AI Instructions (Optional)</label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Keep it concise, formal, and emphasize duty attendance period."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* PHOTOGRAPHS (FOR REPORTS & CLOSING MEETINGS) */}
          {docType !== "application" && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Event Photographs (Optional)
              </h2>
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

          {/* SUBMIT BUTTON */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-5 py-3 rounded-xl border border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-700 transition-all hover:scale-[1.01] flex items-center gap-2"
            >
              Generate & Draft with Gemini
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 font-semibold">Loading...</div>}>
      <WizardContent />
    </Suspense>
  );
}
