"use client";
import React, { useState, useEffect, useRef } from "react";
import type { FormState, ReportData } from "@/types/report";

type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isNew?: boolean;
};

type Props = {
  form: FormState;
  setForm: (f: FormState) => void;
  setAi: (a: ReportData) => void;
  apiKey: string;
};

function TypingText({ text, isNew }: { text: string; isNew?: boolean }) {
  const [displayedText, setDisplayedText] = useState(isNew ? "" : text);
  const [isTyping, setIsTyping] = useState(isNew ?? false);

  useEffect(() => {
    if (!isNew) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [text, isNew]);

  return (
    <span>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 bg-blue-600 ml-1 animate-pulse rounded-sm align-middle" />
      )}
    </span>
  );
}

export function AIChatAssistant({ form, setForm, setAi, apiKey }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hi! I am your AI Assistant. Ask me to rewrite sections, add bullet points, refine the tone, or update document details!",
      timestamp: "Just now",
      isNew: false,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputPrompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isNew: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = inputPrompt;
    setInputPrompt("");
    setLoading(true);

    try {
      // Append the chat prompt to instructions and trigger generation
      const updatedInstructions = form.instructions
        ? `${form.instructions}\nChat request: ${currentPrompt}`
        : `Chat request: ${currentPrompt}`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          instructions: updatedInstructions,
          apiKey,
        }),
      });

      const resText = await res.text();
      let json;
      try {
        json = JSON.parse(resText);
      } catch {
        throw new Error(
          res.status === 500
            ? "Server error during generation. Please verify your Gemini API key or try again."
            : `Generation returned unexpected format: ${resText.slice(0, 80)}`
        );
      }

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to update document");
      }

      // Update AI state in real-time and extract form metadata changes
      setAi(json.data);

      const newForm = { ...form, instructions: updatedInstructions };
      if (json.data.generatedTitle) {
        newForm.title = json.data.generatedTitle;
      }
      if (json.data.extractedMetadata) {
        const meta = json.data.extractedMetadata;
        if (meta.recipient) newForm.recipient = meta.recipient;
        if (meta.senderName) newForm.senderName = meta.senderName;
        if (meta.senderDesignation) newForm.senderDesignation = meta.senderDesignation;
        if (meta.date) newForm.date = meta.date;
        if (meta.advisor) newForm.advisor = meta.advisor;
        if (meta.sdpHead) newForm.sdpHead = meta.sdpHead;
        if (meta.principal) newForm.principal = meta.principal;
        if (meta.eventCoordinator) newForm.eventCoordinator = meta.eventCoordinator;
        if (meta.technicalLead) newForm.technicalLead = meta.technicalLead;
        if (meta.organizedBy) newForm.organizedBy = meta.organizedBy;
        if (meta.facultyCoordinator) newForm.facultyCoordinator = meta.facultyCoordinator;
        if (meta.projectTrack) newForm.projectTrack = meta.projectTrack;
        if (meta.teamStructure) newForm.teamStructure = meta.teamStructure;
        if (meta.techStack) newForm.techStack = meta.techStack;
        if (meta.signatoryList) newForm.signatoryList = meta.signatoryList;
      }
      setForm(newForm);

      try {
        localStorage.setItem("auto_draft_form_state", JSON.stringify(newForm));
        localStorage.setItem("auto_draft_ai_state", JSON.stringify(json.data));
      } catch (e) {
        console.error(e);
      }

      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `Done! I've updated your document sections based on: "${currentPrompt}". You can see the updated preview on the right!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isNew: true,
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      const errorReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `Sorry, I ran into an issue updating your document: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isNew: true,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-blue-200 bg-gradient-to-b from-blue-50/50 to-white rounded-2xl shadow-sm overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>Chat with AI Assistant (Live Edits)</span>
        </div>
        <span className="text-xs font-normal bg-blue-500 px-2.5 py-1 rounded-full">
          {isOpen ? "Hide Chat" : "Open Chat"}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          <div className="max-h-64 overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none font-medium"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
                >
                  {msg.sender === "ai" ? (
                    <TypingText text={msg.text} isNew={msg.isNew} />
                  ) : (
                    msg.text
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-2xl px-3 py-2 w-fit">
                <span className="font-medium text-[11px] text-blue-700">AI is editing your document</span>
                <div className="flex gap-1 items-center ml-1">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-gray-100">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="e.g. Make the text formal, add 3 bullet points..."
              className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-blue-600 focus:outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
