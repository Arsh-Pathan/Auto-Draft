"use client";
import React, { useState } from "react";
import type { FormState, ReportData } from "@/types/report";

type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
};

type Props = {
  form: FormState;
  setForm: (f: FormState) => void;
  setAi: (a: ReportData) => void;
  apiKey: string;
};

export function AIChatAssistant({ form, setForm, setAi, apiKey }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hi! I am your AI Assistant. Ask me to rewrite sections, add bullet points, refine the tone, or update document details!",
      timestamp: "Just now",
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputPrompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to update document");
      }

      // Update AI state in real-time
      setAi(json.data);
      setForm({ ...form, instructions: updatedInstructions });

      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `Done! I've updated your document sections based on: "${currentPrompt}". You can see the updated preview on the right!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        <span className="text-xs font-normal bg-blue-500 px-2 py-0.5 rounded-full">
          {isOpen ? "Collapse" : "Open Chat"}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none font-medium"
                      : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold animate-pulse">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                AI is editing your document sections...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-gray-100">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="e.g. Make the text more formal, add 3 bullet points..."
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
