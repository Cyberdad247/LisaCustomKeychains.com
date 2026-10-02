"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, User } from "lucide-react";

type ChatMessage = { id: string; sender: "customer" | "lisa"; text: string; at: number };
type SessionSummary = {
  id: string;
  name: string;
  createdAt: number;
  lastActivity: number;
  unread: number;
  preview: string;
  messageCount: number;
};

const POLL_MS = 3000;

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function LiveChatInboxPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/live-chat/sessions");
      if (res.status === 401) return; // session expired — editor layout handles sign-in
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch { /* poll failed — retry next tick */ }
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/live-chat/messages?sessionId=${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setActiveName(data.session.name);
      setMessages(data.session.messages ?? []);
      // Refresh the list so unread counts clear.
      loadSessions();
    } catch { /* ignore */ }
  }, [loadSessions]);

  useEffect(() => {
    loadSessions();
    const t = setInterval(loadSessions, POLL_MS);
    return () => clearInterval(t);
  }, [loadSessions]);

  // When the active session gets new messages, refresh it.
  useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => loadMessages(activeId), POLL_MS);
    return () => clearInterval(t);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const openSession = (id: string) => {
    setActiveId(id);
    setMessages([]);
    loadMessages(id);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/live-chat/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeId, text }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message].sort((a, b) => a.at - b.at));
      }
      setInput("");
      loadSessions();
    } catch { /* keep the text so she can retry */ }
    setSending(false);
  };

  const totalUnread = sessions.reduce((n, s) => n + s.unread, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-black tracking-widest uppercase text-gray-900">
          Live{" "}
          <span className="bg-chromium-purple bg-300% animate-chromium-glint text-transparent bg-clip-text">
            Chat
          </span>
          {totalUnread > 0 && (
            <span className="ml-3 inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold align-middle">
              {totalUnread}
            </span>
          )}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Shoppers chatting with you right now — replies send instantly. Keep this tab open and you show as online.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Session list */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Conversations ({sessions.length})
            </p>
          </div>
          <div className="divide-y divide-stone-100 max-h-[60vh] overflow-y-auto">
            {sessions.length === 0 && (
              <p className="p-6 text-xs text-slate-400 text-center">
                No chats yet. When a shopper opens the chat widget on the storefront, they'll appear here.
              </p>
            )}
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => openSession(s.id)}
                className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors ${
                  activeId === s.id ? "bg-purple-50 border-l-4 border-l-purple-700" : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {s.name}
                    {s.unread > 0 && (
                      <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {s.unread}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400">{timeAgo(s.lastActivity)}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-1">{s.preview}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden min-h-[60vh]">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 p-8">
              <MessageCircle className="w-10 h-10" />
              <p className="text-sm">Pick a conversation to start replying.</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">
                  {activeName || "…"}
                  <span className="ml-2 text-[10px] font-normal text-green-600">● live</span>
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#FCFCFC] max-h-[50vh]">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "lisa" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        m.sender === "lisa"
                          ? "bg-purple-700 text-white rounded-br-sm"
                          : "bg-white border border-stone-200 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      {m.sender === "customer" && (
                        <p className="text-[10px] font-bold text-purple-700 mb-0.5">{activeName}</p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="flex items-center gap-2 border-t border-stone-100 p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={`Reply to ${activeName || "shopper"}…`}
                  maxLength={500}
                  className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !input.trim()}
                  aria-label="Send reply"
                  className="p-2.5 rounded-full bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
