"use client";

import { useState } from "react";
import type { IBudget, Category } from "@/types/index";
import { CATEGORY_COLORS } from "@/types/index";
import { Button } from "@/components/ui/Button";

interface BudgetListProps {
  budgets: IBudget[];
  spentByCategory: Record<string, number>;
  onEdit: (budget: IBudget) => void;
  onDelete: (id: string) => void;
  onAddBudget?: () => void;
}

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BudgetList({
  budgets,
  spentByCategory,
  onEdit,
  onDelete,
  onAddBudget,
}: BudgetListProps): JSX.Element {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (budgets.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 text-center">
        <div className="rounded-full bg-gray-100 p-3">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">No budgets set for this period</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Set a monthly limit per category to track your spending
          </p>
        </div>
        {onAddBudget && (
          <Button size="sm" onClick={onAddBudget}>
            Set Budget
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {budgets.map((budget) => {
        const spent = spentByCategory[budget.category] ?? 0;
        const pct = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
        const pctRounded = Math.round(pct);
        const barColor =
          pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-yellow-400" : "bg-green-500";
        const chipLabel =
          pct >= 100 ? "Over budget!" : pct >= 80 ? "Near limit" : "On track";
        const chipColor =
          pct >= 100
            ? "bg-red-100 text-red-700"
            : pct >= 80
            ? "bg-yellow-100 text-yellow-700"
            : "bg-green-100 text-green-700";

        return (
          <div key={budget._id} className="rounded-xl bg-white p-5 shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[budget.category as Category] ?? "#94a3b8",
                  }}
                />
                <span className="font-medium text-gray-900">{budget.category}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${chipColor}`}>
                  {chipLabel}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {confirmDeleteId === budget._id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Delete?</span>
                    <button
                      onClick={() => {
                        onDelete(budget._id);
                        setConfirmDeleteId(null);
                      }}
                      className="rounded px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded px-2 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(budget)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label={`Edit ${budget.category} budget`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(budget._id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${budget.category} budget`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              {formatINR(spent)} spent of {formatINR(budget.monthlyLimit)} ({pctRounded}%)
            </p>
          </div>
        );
      })}
    </div>
  );
}
