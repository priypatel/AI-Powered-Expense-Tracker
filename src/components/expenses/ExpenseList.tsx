"use client";

import { useState } from "react";
import type { IExpense } from "@/types/index";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Category } from "@/types/index";

interface ExpenseListProps {
  expenses: IExpense[];
  loading?: boolean;
  onEdit: (expense: IExpense) => void;
  onDelete: (id: string) => void;
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
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard(): JSX.Element {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-gray-200" />
      ))}
    </div>
  );
}

export function ExpenseList({
  expenses,
  loading = false,
  onEdit,
  onDelete,
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
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-500 text-center px-4">
          No expenses found. Try adjusting your filters or add a new expense.
        </p>
      </div>
    );
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
                      >
                        Yes
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmingId(null)}
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(expense)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setConfirmingId(expense._id)}
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
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{expense.note}</p>
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
                  >
                    Yes
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmingId(null)}>
                    No
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(expense)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setConfirmingId(expense._id)}
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
