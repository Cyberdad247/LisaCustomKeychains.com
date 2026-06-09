"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { type TriageCheck, type TriageReport, type TriageStatus } from "@/app/api/triage/route";

const STATUS_CONFIG: Record<
  TriageStatus,
  { icon: typeof CheckCircle; color: string; dot: string; label: string }
> = {
  ok: {
    icon: CheckCircle,
    color: "text-emerald-600",
    dot: "bg-emerald-500",
    label: "OK",
  },
  warn: {
    icon: AlertTriangle,
    color: "text-amber-600",
    dot: "bg-amber-400",
    label: "Warn",
  },
  error: {
    icon: XCircle,
    color: "text-rose-600",
    dot: "bg-rose-500",
    label: "Error",
  },
  unconfigured: {
    icon: HelpCircle,
    color: "text-slate-400",
    dot: "bg-slate-300",
    label: "Not set",
  },
};

function CheckRow({ check }: { check: TriageCheck }) {
  const cfg = STATUS_CONFIG[check.status];
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-gray-900">{check.label}</span>
          <span
            className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
              check.status === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : check.status === "warn"
                  ? "bg-amber-50 text-amber-700"
                  : check.status === "error"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-gray-100 text-gray-500"
            }`}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{check.detail}</p>
        {check.fix && (
          <a
            href={check.fix}
            target={check.fix.startsWith("http") ? "_blank" : undefined}
            rel={check.fix.startsWith("http") ? "noopener noreferrer" : undefined}
            className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-900 transition-colors"
          >
            Fix this
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500";
  return (
    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 border-current shrink-0 relative">
      <span className={`text-xl font-black leading-none ${color}`}>{score}</span>
      <span className="text-[8px] uppercase tracking-wide text-gray-400">score</span>
    </div>
  );
}

export default function TriagePanel() {
  const [report, setReport] = useState<TriageReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTriage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/triage");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReport(await res.json());
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTriage(); }, [fetchTriage]);

  const issueCount = report?.checks.filter(
    (c) => c.status === "error" || c.status === "warn",
  ).length ?? 0;

  return (
    <div className="bg-white border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                loading
                  ? "bg-purple-400"
                  : issueCount > 0
                    ? "bg-amber-400"
                    : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                loading
                  ? "bg-purple-500"
                  : issueCount > 0
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />
          </span>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">
            System Triage
          </h2>
          <span className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">
            · Nanobot
          </span>
        </div>
        <button
          onClick={fetchTriage}
          disabled={loading}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-purple-700 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Re-check
        </button>
      </div>

      <div className="p-5">
        {loading && !report && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
            <span className="ml-3 text-xs text-gray-400 uppercase tracking-widest">Running checks…</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700 font-semibold">
            Triage failed: {error}
          </div>
        )}

        {report && (
          <>
            {/* Score row */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
              <ScoreRing score={report.score} />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {report.score >= 80
                    ? "Everything looks healthy"
                    : report.score >= 50
                      ? `${issueCount} issue${issueCount !== 1 ? "s" : ""} to review`
                      : "Attention needed"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Last checked{" "}
                  {new Date(report.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Check rows */}
            <div>
              {report.checks.map((check) => (
                <CheckRow key={check.label} check={check} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
