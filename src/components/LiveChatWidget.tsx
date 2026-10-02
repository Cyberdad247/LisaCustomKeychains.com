"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";

// Live chat with Lisa — the editor project is the chat hub.
const CHAT_API = "https://lisa-custom-keychains-editor.vercel.app/api/live-chat";
const POLL_MS = 3000;

type ChatMessage = { id: string; sender: "customer" | "lisa"; text: string; at: number };

export default function LiveChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [lisaOnline, setLisaOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const sinceRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Don't render inside the editor — Lisa answers from there.
  const hidden = pathname?.startsWith("/editor") || pathname?.startsWith("/client-editor");

  useEffect(() => {
    try {
      const n = localStorage.getItem("lck_chat_name") ?? "";
      const s = localStorage.getItem("lck_chat_session") ?? "";
      if (n) setName(n);
      if (s) setSessionId(s);
    } catch { /* private mode */ }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  const poll = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${CHAT_API}/poll?sessionId=${sessionId}&since=${sinceRef.current}`);
      if (!res.ok) return;
      const data = await res.json();
      setLisaOnline(!!data.lisaOnline);
      const fresh: ChatMessage[] = data.messages ?? [];
      if (fresh.length > 0) {
        sinceRef.current = Math.max(...fresh.map((m) => m.at), sinceRef.current);
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          return [...prev, ...fresh.filter((m) => !ids.has(m.id))].sort((a, b) => a.at - b.at);
        });
      }
    } catch { /* chat poll failed — retry next tick */ }
  }, [sessionId]);

  useEffect(() => {
    if (!open || !sessionId) return;
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [open, sessionId, poll]);

  const startChat = () => {
    const n = nameInput.trim().slice(0, 40) || "Guest";
    setName(n);
    try { localStorage.setItem("lck_chat_name", n); } catch { /* ignore */ }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${CHAT_API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name, text }),
      });
      const data = await res.json();
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        try { localStorage.setItem("lck_chat_session", data.sessionId); } catch { /* ignore */ }
      }
      if (data.message) {
        sinceRef.current = Math.max(sinceRef.current, data.message.at);
        setMessages((prev) => [...prev, data.message].sort((a, b) => a.at - b.at));
      }
      setInput("");
    } catch { /* send failed — keep the text so they can retry */ }
    setSending(false);
  };

  if (hidden) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat with Lisa"
          className="fixed bottom-6 left-6 z-[90] flex items-center gap-2 rounded-full bg-[#6A0DAD] text-white pl-4 pr-5 py-3 shadow-xl hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#6A0DAD] focus:ring-offset-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Chat with Lisa</span>
          <span className={`w-2 h-2 rounded-full ${lisaOnline ? "bg-green-400" : "bg-[#D4AF37]"}`} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 left-6 z-[90] w-[min(380px,calc(100vw-3rem))] h-[min(560px,70vh)] bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#6A0DAD] text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${lisaOnline ? "bg-green-400" : "bg-[#D4AF37]"}`} />
              <div>
                <p className="text-sm font-bold leading-tight">Chat with Lisa</p>
                <p className="text-[11px] opacity-80 leading-tight">
                  {lisaOnline ? "Lisa is online now" : "Lisa is away — she'll reply soon"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-1 rounded-full hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!name ? (
            /* Name gate */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <MessageCircle className="w-10 h-10 text-[#6A0DAD]" />
              <p className="text-sm text-slate-600">
                Questions about a design, an order, or a custom piece? You're talking to the maker herself.
              </p>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startChat()}
                placeholder="What should Lisa call you?"
                maxLength={40}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A0DAD]"
              />
              <button
                type="button"
                onClick={startChat}
                className="rounded-lg bg-[#6A0DAD] text-white text-sm font-semibold px-6 py-2 hover:bg-[#5a0b93]"
              >
                Start chatting
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#FCFCFC]">
                {messages.length === 0 && (
                  <p className="text-xs text-slate-400 text-center mt-6">
                    Say hello — {lisaOnline ? "Lisa usually replies within a minute." : "leave a message and Lisa will get back to you."}
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        m.sender === "customer"
                          ? "bg-[#6A0DAD] text-white rounded-br-sm"
                          : "bg-white border border-stone-200 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      {m.sender === "lisa" && (
                        <p className="text-[10px] font-bold text-[#6A0DAD] mb-0.5">Lisa</p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 border-t border-stone-100 p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type your message…"
                  maxLength={500}
                  className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A0DAD]"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !input.trim()}
                  aria-label="Send message"
                  className="p-2.5 rounded-full bg-[#6A0DAD] text-white hover:bg-[#5a0b93] disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
