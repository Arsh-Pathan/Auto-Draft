"use client";
import React from "react";
import Image from "next/image";

export default function LandingMenu() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Image
            src="/logo.svg"
            alt="Dhole Patil Education Society"
            width={629}
            height={539}
            className="h-28 w-auto mx-auto mb-8 drop-shadow-sm"
          />
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600 mb-3">
            AI &amp; ML Club
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
            AutoDraft &amp; Report Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select an official document format below to draft professional, perfectly-formatted outputs using the Gemini AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <a 
            href="/wizard?type=report"
            className="group relative flex flex-col bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Activity Report</h2>
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
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Closing Meeting Report</h2>
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Project Proposal Form</h2>
              <p className="text-gray-600 flex-grow mb-6 text-sm leading-relaxed">
                Official AI &amp; ML Club 30-day project approval application. Includes hardware/software track details, tech stack, budget requests, lab access requirements, and approval signatures.
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-14 w-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Official Application</h2>
              <p className="text-gray-600 flex-grow mb-6 text-sm leading-relaxed">
                Draft official request letters directed to DPCOE authorities. Ideal for requesting leave, facility bookings, event permissions, or official club endorsements.
              </p>
              <div className="inline-flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all text-base">
                Draft Application <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </a>
        </div>

        <div className="mt-16 text-center text-sm text-gray-400 font-medium">
          <p>Built with Next.js App Router, Gemini AI &amp; docx</p>
        </div>
      </div>
    </main>
  );
}
