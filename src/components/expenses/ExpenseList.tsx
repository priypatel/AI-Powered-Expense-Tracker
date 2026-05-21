"use client";

import { useState } from "react";
import type { IExpense } from "@/types/index";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Category } from "@/types/index";

interface ExpenseListProps {
  expenses: IExpense[];
  loading?: boolean;
  onEdit: (expense: IExpense) => void;
  onDelete: (id: string) => void;
  hasFilters?: boolean;
  onAddExpense?: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function SkeletonRow(): JSX.Element {
  return (
    <tr>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-7 w-24" /></td>
    </tr>
  );
}

function SkeletonCard(): JSX.Element {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-7 w-28" />
    </div>
  );
}

function EmptyState({
  hasFilters,
  onAddExpense,
}: {
  hasFilters: boolean;
  onAddExpense?: () => void;
}): JSX.Element {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-6 text-center">
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">No expenses found</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {hasFilters
            ? "Try adjusting your filters to see more results"
            : "Add your first expense to get started"}
        </p>
      </div>
      {!hasFilters && onAddExpense && (
        <Button size="sm" onClick={onAddExpense}>
          Add Expense
        </Button>
      )}
    </div>
  );
}

export function ExpenseList({
  expenses,
  loading = false,
  onEdit,
  onDelete,
  hasFilters = false,
  onAddExpense,
}: ExpenseListProps): JSX.Element {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (loading) {
    return (
      <>
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {["Date", "Category", "Amount", "Note", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </>
    );
  }

  if (expenses.length === 0) {
    return <EmptyState hasFilters={hasFilters} onAddExpense={onAddExpense} />;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {["Date", "Category", "Amount", "Note", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3">
                  <Badge category={expense.category as Category} />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {formatAmount(expense.amount)}
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                  {expense.note ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {confirmingId === expense._id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Confirm delete?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          onDelete(expense._id);
                          setConfirmingId(null);
                        }}
                        aria-label="Confirm delete expense"
                      >
                        Yes
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmingId(null)}
                        aria-label="Cancel delete"
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(expense)}
                        aria-label={`Edit expense — ${formatAmount(expense.amount)}`}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setConfirmingId(expense._id)}
                        aria-label={`Delete expense — ${formatAmount(expense.amount)}`}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense._id}
            className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="text-base font-semibold text-gray-900">
                  {formatAmount(expense.amount)}
                </div>
                <Badge category={expense.category as Category} />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDate(expense.date)}
              </span>
            </div>
            {expense.note && (
              <p className="mt-2 text-sm italic text-gray-500 line-clamp-2">{expense.note}</p>
            )}
            <div className="mt-3 flex gap-2">
              {confirmingId === expense._id ? (
                <>
                  <span className="text-xs text-gray-600 self-center">Confirm delete?</span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      onDelete(expense._id);
                      setConfirmingId(null);
                    }}
                    aria-label="Confirm delete expense"
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmingId(null)}
                    aria-label="Cancel delete"
                  >
                    No
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(expense)}
                    aria-label={`Edit expense — ${formatAmount(expense.amount)}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setConfirmingId(expense._id)}
                    aria-label={`Delete expense — ${formatAmount(expense.amount)}`}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
