"use client";

import { AlertTriangle, X } from "lucide-react";

/**
 * Shared visible error banner for editor save/write failures.
 * Save functions must set an error message here instead of only console.error —
 * Lisa should never watch a spinner stop and wonder whether her work saved.
 */
export default function EditorErrorBanner({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 mb-4"
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 transition-colors"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
