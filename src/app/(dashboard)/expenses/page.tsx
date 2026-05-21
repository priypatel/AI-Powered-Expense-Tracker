"use client";

import { useState, useEffect, useCallback } from "react";
import type { IExpense } from "@/types/index";
import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/useToast";
import { ExpenseFilters, type FilterState } from "@/components/expenses/ExpenseFilters";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AIExtractModal } from "@/components/expenses/AIExtractModal";

export default function ExpensesPage(): JSX.Element {
  const { expenses, total, loading, fetchExpenses, createExpense, updateExpense, deleteExpense } =
    useExpenses();
  const { show } = useToast();

  const [filters, setFilters] = useState<FilterState>({ category: "", month: "", year: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);

  const buildFilters = useCallback(
    (state: FilterState) => ({
      ...(state.category ? { category: state.category } : {}),
      ...(state.month !== "" ? { month: Number(state.month) } : {}),
      ...(state.year !== "" ? { year: Number(state.year) } : {}),
    }),
    []
  );

  useEffect(() => {
    fetchExpenses(buildFilters(filters));
  }, [filters, fetchExpenses, buildFilters]);

  function openAddModal(): void {
    setEditingExpense(null);
    setModalOpen(true);
  }

  function openEditModal(expense: IExpense): void {
    setEditingExpense(expense);
    setModalOpen(true);
  }

  function closeModal(): void {
    setModalOpen(false);
    setEditingExpense(null);
  }

  async function handleFormSubmit(data: {
    amount: number;
    category: string;
    date: string;
    note?: string;
  }): Promise<void> {
    if (editingExpense) {
      await updateExpense(editingExpense._id, data);
      show("Expense updated");
    } else {
      await createExpense(data);
      show("Expense added");
    }
    closeModal();
    await fetchExpenses(buildFilters(filters));
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await deleteExpense(id);
      show("Expense deleted");
      await fetchExpenses(buildFilters(filters));
    } catch {
      show("Failed to delete expense", "error");
    }
  }

  async function handleExport(): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (filters.month !== "") params.set("month", String(filters.month));
      if (filters.year !== "") params.set("year", String(filters.year));
      const url = `/api/expenses/export${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition") ?? "";
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : "expenses.csv";

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      const rowCount = (await blob.text()).split("\n").length - 1;
      show(`Exported ${rowCount} expense${rowCount !== 1 ? "s" : ""}`);
    } catch {
      show("Export failed", "error");
    }
  }

  const hasFilters =
    filters.category !== "" || filters.month !== "" || filters.year !== "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {total} expense{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setAiModalOpen(true)}>
            AI Auto-Fill
          </Button>
          <Button onClick={openAddModal}>Add Expense</Button>
        </div>
      </div>

      {/* Filters + Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ExpenseFilters filters={filters} onChange={setFilters} />
        <Button variant="secondary" onClick={() => void handleExport()}>
          Export CSV
        </Button>
      </div>

      {/* List */}
      <ExpenseList
        expenses={expenses}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
        hasFilters={hasFilters}
        onAddExpense={openAddModal}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingExpense ? "Edit Expense" : "Add Expense"}
      >
        <ExpenseForm
          initialData={editingExpense ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>

      {/* AI Extract Modal */}
      <AIExtractModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onExpenseSaved={() => {
          void fetchExpenses(buildFilters(filters));
          show("Expense added");
        }}
      />
    </div>
  );
}
