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
            className="group relative flex flex-col bg-white rounded-3xl p-10 border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Activity Report</h2>
              <p className="text-gray-600 flex-grow mb-8 text-base leading-relaxed">
                Generate standard event reports for AI &amp; ML club activities. Includes automated structuring of notes, bullet points, schedules, and integrated event photographs in the standard A4 layout.
              </p>
              <div className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-3 transition-all text-lg">
                Draft Report <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </a>

          <a 
            href="/wizard?type=application"
            className="group relative flex flex-col bg-white rounded-3xl p-10 border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="h-16 w-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Official Application</h2>
              <p className="text-gray-600 flex-grow mb-8 text-base leading-relaxed">
                Draft official request letters and applications directed to DPCOE authorities. Ideal for requesting leave, facility bookings, event permissions, or official club endorsements.
              </p>
              <div className="inline-flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all text-lg">
                Draft Application <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
