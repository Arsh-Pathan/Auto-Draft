"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FormState, ReportData } from "@/types/report";

export default function LandingMenu() {
  const [savedForm, setSavedForm] = useState<FormState | null>(null);
  const [savedAi, setSavedAi] = useState<ReportData | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  useEffect(() => {
    try {
      const rawForm = localStorage.getItem("auto_draft_form_state");
      const rawAi = localStorage.getItem("auto_draft_ai_state");
      if (rawForm) {
        setSavedForm(JSON.parse(rawForm));
        setHasSavedDraft(true);
      }
      if (rawAi) {
        setSavedAi(JSON.parse(rawAi));
      }
    } catch (e) {
      console.error("Failed to read saved draft from localStorage", e);
    }
  }, []);

  const handleClearSavedDraft = () => {
    if (confirm("Are you sure you want to clear your locally saved draft?")) {
      localStorage.removeItem("auto_draft_form_state");
      localStorage.removeItem("auto_draft_ai_state");
      localStorage.removeItem("auto_draft_photos");
      setSavedForm(null);
      setSavedAi(null);
      setHasSavedDraft(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Professional Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.svg"
              alt="Dhole Patil Education Society Logo"
              width={200}
              height={60}
              className="h-12 w-auto shrink-0"
              priority
            />
            <div className="h-8 w-px bg-gray-300 hidden sm:block" />
            <div className="flex items-center gap-3">
              <Image
                src="/club-logo.png"
                alt="AI & ML Club DPES Logo"
                width={50}
                height={50}
                className="h-10 w-10 shrink-0 rounded-full border border-blue-600 shadow-sm"
              />
              <div className="hidden md:block">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                  AI &amp; ML Club · DPES
                </span>
                <span className="text-xs font-medium text-gray-500">
                  Intelligence Through Innovation · Est. 2026
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasSavedDraft && (
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Saved Draft Available
              </Link>
            )}
            <a
              href="#templates"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-gray-700 hover:text-black transition-colors"
            >
              Templates
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero Banner */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-12">
        <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Official Document Generator · Dhole Patil College of Engineering
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              AutoDraft &amp; Activity Report Portal
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Transform rough event notes, images, meeting highlights, and technical proposal forms into professionally-styled PDF and DOCX reports powered by Gemini AI.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href="#templates"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:scale-[1.02]"
              >
                Create New Document
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              {hasSavedDraft && (
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all hover:scale-[1.02]"
                >
                  Resume Saved Draft
                </Link>
              )}
            </div>
          </div>

          <div className="absolute right-6 bottom-6 opacity-10 pointer-events-none hidden lg:block">
            <Image
              src="/club-logo.png"
              alt="Background Seal"
              width={300}
              height={300}
              className="h-72 w-72"
            />
          </div>
        </section>

        {/* Saved Reports & Drafts Section */}
        {hasSavedDraft && savedForm && (
          <section className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-emerald-200/80 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                  Saved Local Session
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  {savedForm.title || "Untitled Saved Document Draft"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearSavedDraft}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  Clear Saved Draft
                </button>
                <Link
                  href="/editor"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Open in Editor &rarr;
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-gray-700">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Format</span>
                <span className="font-bold text-emerald-900 uppercase">
                  {savedForm.docType || "report"}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Date</span>
                <span>{savedForm.date || "Today"}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Sections Generated</span>
                <span>{savedAi?.sections?.length || 0} Sections</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Status</span>
                <span className="text-emerald-700 font-bold">Ready for Export</span>
              </div>
            </div>
          </section>
        )}

        {/* Document Templates Selection Grid */}
        <section id="templates" className="space-y-6 pt-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                Official Document Formats
              </span>
              <h2 className="text-2xl font-bold text-gray-900">Select Document Type</h2>
            </div>
            <p className="text-xs text-gray-500">
              Each template strictly adheres to DPCOE academic format guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <a 
              href="/wizard?type=report"
              className="group relative flex flex-col bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-blue-50/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Activity Report</h3>
                <p className="text-gray-600 flex-grow mb-6 text-sm leading-relaxed">
                  Generate standard event reports for AI &amp; ML club activities. Includes automated notes structuring, bullet points, schedules, and integrated event photographs in standard A4 format.
                </p>
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all text-base">
                  Draft Activity Report <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </a>

            <a 
              href="/wizard?type=closing_meeting"
              className="group relative flex flex-col bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-emerald-50/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Closing Meeting Report</h3>
                <p className="text-gray-600 flex-grow mb-6 text-sm leading-relaxed">
                  Official Student Development Program (SDP) closing meeting document. Formats event timings, challenges faced, team recommendations, and faculty attendance sign-off sheet.
                </p>
                <div className="inline-flex items-center text-emerald-600 font-semibold group-hover:gap-2 transition-all text-base">
                  Draft Closing Meeting <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </a>

            <a 
              href="/wizard?type=project_proposal"
              className="group relative flex flex-col bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-purple-50/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Project Proposal Form</h3>
                <p className="text-gray-600 flex-grow mb-6 text-sm leading-relaxed">
                  Official AI &amp; ML Club 30-day project approval application. Includes hardware/software track details, tech stack, budget requests, lab access requirements, reference links, and approval signatures.
                </p>
                <div className="inline-flex items-center text-purple-600 font-semibold group-hover:gap-2 transition-all text-base">
                  Draft Project Proposal <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </a>

            <a 
              href="/wizard?type=application"
              className="group relative flex flex-col bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-indigo-50/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Official Application</h3>
                <p className="text-gray-600 flex-grow mb-6 text-sm leading-relaxed">
                  Draft official request letters directed to DPCOE authorities. Ideal for requesting leave, facility bookings, event permissions, or official club endorsements.
                </p>
                <div className="inline-flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all text-base">
                  Draft Application <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 mt-16 text-center text-xs text-gray-500 space-y-2">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Image src="/club-logo.png" alt="AI ML Club DPES" width={28} height={28} className="rounded-full" />
          <span className="font-bold text-gray-800">AI &amp; ML Club · Dhole Patil College of Engineering</span>
        </div>
        <p>Intelligence Through Innovation · Established 2026 · DPES Campus, Pune</p>
        <p className="text-gray-400">Powered by Gemini 3.6 Flash &amp; Next.js 15 App Router</p>
      </footer>
    </div>
  );
}
