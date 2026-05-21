"use client";

import { useState, FormEvent } from "react";
import { CATEGORIES, type Category, type IBudget } from "@/types/index";
import { Button } from "@/components/ui/Button";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

interface BudgetFormData {
  category: string;
  monthlyLimit: number;
  month: number;
  year: number;
}

interface BudgetFormProps {
  initialData?: IBudget;
  currentMonth: number;
  currentYear: number;
  existingCategories: Category[];
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onCancel: () => void;
}

interface FieldErrors {
  category?: string;
  monthlyLimit?: string;
}

export function BudgetForm({
  initialData,
  currentMonth,
  currentYear,
  existingCategories,
  onSubmit,
  onCancel,
}: BudgetFormProps): JSX.Element {
  const isEditing = !!initialData;

  const [category, setCategory] = useState(initialData?.category ?? "");
  const [monthlyLimit, setMonthlyLimit] = useState(
    initialData?.monthlyLimit?.toString() ?? ""
  );
  const [month, setMonth] = useState(initialData?.month ?? currentMonth);
  const [year, setYear] = useState(initialData?.year ?? currentYear);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const availableCategories = isEditing
    ? CATEGORIES
    : CATEGORIES.filter((c) => !existingCategories.includes(c));

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!isEditing && !category) next.category = "Category is required";
    const limit = Number(monthlyLimit);
    if (!monthlyLimit) {
      next.monthlyLimit = "Monthly limit is required";
    } else if (!isFinite(limit) || limit < 1) {
      next.monthlyLimit = "Must be at least ₹1";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        category: isEditing ? initialData.category : category,
        monthlyLimit: Number(monthlyLimit),
        month,
        year,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (hasError: boolean): string =>
    `w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="bf-category" className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>
        {isEditing ? (
          <input
            id="bf-category"
            value={initialData.category}
            disabled
            className={inputClass(false)}
          />
        ) : (
          <select
            id="bf-category"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setErrors((prev) => ({ ...prev, category: undefined })); }}
            className={inputClass(!!errors.category)}
            disabled={submitting}
            aria-required="true"
          >
            <option value="">Select category</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="bf-limit" className="mb-1 block text-sm font-medium text-gray-700">
          Monthly Limit (₹)
        </label>
        <input
          id="bf-limit"
          type="number"
          min="1"
          step="0.01"
          value={monthlyLimit}
          onChange={(e) => { setMonthlyLimit(e.target.value); setErrors((prev) => ({ ...prev, monthlyLimit: undefined })); }}
          className={inputClass(!!errors.monthlyLimit)}
          disabled={submitting}
          placeholder="e.g. 5000"
          aria-required="true"
        />
        {errors.monthlyLimit && (
          <p className="mt-1 text-xs text-red-600">{errors.monthlyLimit}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bf-month" className="mb-1 block text-sm font-medium text-gray-700">
            Month
          </label>
          <select
            id="bf-month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={inputClass(false)}
            disabled={submitting || isEditing}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bf-year" className="mb-1 block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            id="bf-year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={inputClass(false)}
            disabled={submitting || isEditing}
          >
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={submitting} className="flex-1">
          {isEditing ? "Save changes" : "Set Budget"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
