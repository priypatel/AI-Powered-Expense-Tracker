"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import type { Category } from "@/types/index";

interface ExtractedData {
  amount: number | null;
  category: Category;
  date: string;
  note: string;
}

interface AIExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseSaved: () => void;
}

const MAX_CHARS = 1000;

export function AIExtractModal({
  isOpen,
  onClose,
  onExpenseSaved,
}: AIExtractModalProps): JSX.Element {
  const [step, setStep] = useState<"input" | "review" | "saving">("input");
  const [text, setText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("input");
      setText("");
      setExtractError(null);
      setExtractedData(null);
      setSaveError(null);
    }
  }, [isOpen]);

  function handleClose(): void {
    if (extracting || step === "saving") return;
    onClose();
  }

  async function handleExtract(): Promise<void> {
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = (await res.json()) as { data?: ExtractedData; error?: string };
      if (!res.ok) {
        setExtractError(json.error ?? "Extraction failed — please try again");
        return;
      }
      if (json.data) {
        setExtractedData(json.data);
        setStep("review");
      }
    } catch {
      setExtractError("Network error — please try again");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSaveExpense(data: {
    amount: number;
    category: string;
    date: string;
    note?: string;
  }): Promise<void> {
    setSaveError(null);
    setStep("saving");
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setStep("review");
      setSaveError(json.error ?? "Failed to save expense");
      throw new Error(json.error ?? "Failed to save expense");
    }
    onExpenseSaved();
    onClose();
  }

  const modalTitle =
    step === "review" || step === "saving" ? "Review & Confirm" : "AI Auto-Fill";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle}>
      {step === "input" && (
        <div className="flex flex-col gap-4">
          {extractError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
              {extractError}
            </div>
          )}
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              rows={6}
              disabled={extracting}
              placeholder="Paste a bill, SMS, bank message, or receipt..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {text.length}/{MAX_CHARS}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleExtract}
              loading={extracting}
              disabled={extracting || text.trim().length < 5}
              className="flex-1"
            >
              Extract with AI ✨
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={extracting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(step === "review" || step === "saving") && extractedData && (
        <div className="flex flex-col gap-3">
          {extractedData.amount === null && (
            <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 border border-blue-200">
              Amount could not be extracted — please enter it manually
            </div>
          )}
          {saveError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
              {saveError}
            </div>
          )}
          <ExpenseForm
            initialData={{
              ...(extractedData.amount !== null ? { amount: extractedData.amount } : {}),
              category: extractedData.category,
              date: extractedData.date,
              note: extractedData.note || undefined,
            }}
            onSubmit={handleSaveExpense}
            onCancel={() => setStep("input")}
          />
        </div>
      )}
    </Modal>
  );
}
