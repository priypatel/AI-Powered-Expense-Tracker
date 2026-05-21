"use client";

import { useState, FormEvent, FocusEvent } from "react";
import { CATEGORIES } from "@/types/index";
import type { IExpense } from "@/types/index";
import { Button } from "@/components/ui/Button";

interface ExpenseFormData {
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface ExpenseFormProps {
  initialData?: Partial<IExpense>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

interface FieldErrors {
  amount?: string;
  category?: string;
  date?: string;
  note?: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({ initialData, onSubmit, onCancel }: ExpenseFormProps): JSX.Element {
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [date, setDate] = useState(
    initialData?.date ? initialData.date.slice(0, 10) : todayISO()
  );
  const [note, setNote] = useState(initialData?.note ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validateField(field: keyof FieldErrors, value: string): string | undefined {
    switch (field) {
      case "amount": {
        const n = Number(value);
        if (!value) return "Amount is required";
        if (!isFinite(n) || n <= 0) return "Amount must be a positive number";
        return undefined;
      }
      case "category":
        if (!value) return "Category is required";
        return undefined;
      case "date":
        if (!value) return "Date is required";
        if (isNaN(new Date(value).getTime())) return "Invalid date";
        return undefined;
      case "note":
        if (value.length > 200) return "Note must be 200 characters or fewer";
        return undefined;
      default:
        return undefined;
    }
  }

  function validateAll(): boolean {
    const next: FieldErrors = {
      amount: validateField("amount", amount),
      category: validateField("category", category),
      date: validateField("date", date),
      note: validateField("note", note),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  function handleBlur(field: keyof FieldErrors, value: string): void {
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!validateAll()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        amount: Number(amount),
        category,
        date,
        note: note.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (hasError: boolean): string =>
    `w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="ef-amount" className="mb-1 block text-sm font-medium text-gray-700">
          Amount (₹)
        </label>
        <input
          id="ef-amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setErrors((prev) => ({ ...prev, amount: undefined })); }}
          onBlur={(e: FocusEvent<HTMLInputElement>) => handleBlur("amount", e.target.value)}
          className={inputClass(!!errors.amount)}
          disabled={submitting}
          placeholder="0.00"
          aria-required="true"
        />
        {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
      </div>

      <div>
        <label htmlFor="ef-category" className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="ef-category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setErrors((prev) => ({ ...prev, category: undefined })); }}
          onBlur={(e: FocusEvent<HTMLSelectElement>) => handleBlur("category", e.target.value)}
          className={inputClass(!!errors.category)}
          disabled={submitting}
          aria-required="true"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="ef-date" className="mb-1 block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="ef-date"
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setErrors((prev) => ({ ...prev, date: undefined })); }}
          onBlur={(e: FocusEvent<HTMLInputElement>) => handleBlur("date", e.target.value)}
          className={inputClass(!!errors.date)}
          disabled={submitting}
          aria-required="true"
        />
        {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
      </div>

      <div>
        <label htmlFor="ef-note" className="mb-1 block text-sm font-medium text-gray-700">
          Note{" "}
          <span className="text-gray-400 font-normal">
            ({note.length}/200)
          </span>
        </label>
        <textarea
          id="ef-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={(e: FocusEvent<HTMLTextAreaElement>) => handleBlur("note", e.target.value)}
          maxLength={200}
          rows={3}
          className={`${inputClass(!!errors.note)} resize-none`}
          disabled={submitting}
          placeholder="Optional note…"
        />
        {errors.note && <p className="mt-1 text-xs text-red-600">{errors.note}</p>}
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={submitting} className="flex-1">
          {initialData ? "Save changes" : "Add expense"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
