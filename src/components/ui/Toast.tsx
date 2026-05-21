"use client";

import { useState } from "react";
import type { ToastItem } from "@/hooks/useToast";

const TYPE_STYLES: Record<ToastItem["type"], string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
};

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}): JSX.Element {
  const [leaving, setLeaving] = useState(false);

  function handleDismiss(): void {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 250);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg
        animate-in slide-in-from-right-5 duration-300
        transition-opacity duration-[250ms]
        ${TYPE_STYLES[toast.type]}
        ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}): JSX.Element {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
