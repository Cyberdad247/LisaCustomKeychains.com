/**
 * Live chat store — in-memory session/message storage for shopper ↔ Lisa chat.
 *
 * The editor Vercel project is the chat hub: the storefront widget and Lisa's
 * editor inbox both talk to the editor's /api/live-chat/* routes, so they
 * share this module-level state.
 *
 * NOTE (scale): module state is per serverless instance and does not survive
 * redeploys. Fine for boutique-scale chat (a handful of concurrent sessions);
 * if volume grows, swap this for a shared store (Redis/VPS) behind the same
 * function signatures.
 */

export type ChatSender = "customer" | "lisa";

export type ChatMessage = {
  id: string;
  sender: ChatSender;
  text: string;
  at: number;
};

export type ChatSession = {
  id: string;
  name: string;
  createdAt: number;
  lastActivity: number;
  /** Last time Lisa opened this session — drives unread counts. */
  lisaReadAt: number;
  messages: ChatMessage[];
};

export type ChatSessionSummary = {
  id: string;
  name: string;
  createdAt: number;
  lastActivity: number;
  unread: number;
  preview: string;
  messageCount: number;
};

const sessions = new Map<string, ChatSession>();
/** Last time Lisa's inbox polled — drives the "Lisa is online" indicator. */
let lisaLastSeenAt = 0;

const MAX_SESSIONS = 100;
const MAX_MESSAGES_PER_SESSION = 200;
const SESSION_TTL_MS = 48 * 3600 * 1000; // prune sessions idle > 48h
const LISA_ONLINE_WINDOW_MS = 90 * 1000;

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function prune() {
  const now = Date.now();
  const ids: string[] = [];
  sessions.forEach((s, id) => {
    if (now - s.lastActivity > SESSION_TTL_MS) ids.push(id);
  });
  for (const id of ids) sessions.delete(id);
  if (sessions.size > MAX_SESSIONS) {
    const sorted = Array.from(sessions.values()).sort((a, b) => a.lastActivity - b.lastActivity);
    for (const s of sorted.slice(0, sessions.size - MAX_SESSIONS)) sessions.delete(s.id);
  }
}

export function createSession(name: string): ChatSession {
  prune();
  const now = Date.now();
  const session: ChatSession = {
    id: uid(),
    name: (name || "Guest").slice(0, 40),
    createdAt: now,
    lastActivity: now,
    lisaReadAt: 0,
    messages: [],
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): ChatSession | undefined {
  return sessions.get(id);
}

export function addMessage(sessionId: string, sender: ChatSender, text: string): ChatMessage | null {
  const s = sessions.get(sessionId);
  if (!s) return null;
  const clean = text.trim().slice(0, 500);
  if (!clean) return null;
  const msg: ChatMessage = { id: uid(), sender, text: clean, at: Date.now() };
  s.messages.push(msg);
  if (s.messages.length > MAX_MESSAGES_PER_SESSION) {
    s.messages = s.messages.slice(-MAX_MESSAGES_PER_SESSION);
  }
  s.lastActivity = msg.at;
  return msg;
}

export function listSessionSummaries(): ChatSessionSummary[] {
  prune();
  return Array.from(sessions.values())
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .map((s) => {
      const last = s.messages[s.messages.length - 1];
      return {
        id: s.id,
        name: s.name,
        createdAt: s.createdAt,
        lastActivity: s.lastActivity,
        unread: s.messages.filter((m: ChatMessage) => m.sender === "customer" && m.at > s.lisaReadAt).length,
        preview: last ? `${last.sender === "lisa" ? "Lisa: " : ""}${last.text.slice(0, 80)}` : "(no messages yet)",
        messageCount: s.messages.length,
      };
    });
}

export function markSessionRead(sessionId: string) {
  const s = sessions.get(sessionId);
  if (s) s.lisaReadAt = Date.now();
}

/** Called whenever Lisa's inbox polls — keeps her "online" presence fresh. */
export function markLisaSeen() {
  lisaLastSeenAt = Date.now();
}

export function isLisaOnline(): boolean {
  return Date.now() - lisaLastSeenAt < LISA_ONLINE_WINDOW_MS;
}
