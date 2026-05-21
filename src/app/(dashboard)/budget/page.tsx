"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { IBudget, Category } from "@/types/index";
import { useBudgets } from "@/hooks/useBudgets";
import { useExpenses } from "@/hooks/useExpenses";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { BudgetList } from "@/components/budget/BudgetList";
import { BudgetAlertBanner } from "@/components/dashboard/BudgetAlertBanner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export default function BudgetPage(): JSX.Element {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<IBudget | null>(null);

  const { budgets, fetchBudgets, createBudget, updateBudget, deleteBudget } = useBudgets();
  const { expenses, fetchExpenses } = useExpenses();

  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([
      fetchBudgets(selectedMonth, selectedYear),
      fetchExpenses({ month: selectedMonth, year: selectedYear, limit: 100 }),
    ]);
  }, [selectedMonth, selectedYear, fetchBudgets, fetchExpenses]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const spentByCategory = useMemo((): Record<string, number> => {
    return expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
      return acc;
    }, {});
  }, [expenses]);

  const budgetAlerts = useMemo(() =>
    budgets.map((budget) => {
      const spent = spentByCategory[budget.category] ?? 0;
      const pct = Math.round((spent / budget.monthlyLimit) * 100);
      return { category: budget.category, spent, limit: budget.monthlyLimit, pct };
    }),
    [budgets, spentByCategory]
  );

  const existingCategories = budgets.map((b) => b.category as Category);

  function openAddModal(): void {
    setEditingBudget(null);
    setModalOpen(true);
  }

  function openEditModal(budget: IBudget): void {
    setEditingBudget(budget);
    setModalOpen(true);
  }

  function closeModal(): void {
    setModalOpen(false);
    setEditingBudget(null);
  }

  async function handleFormSubmit(data: {
    category: string;
    monthlyLimit: number;
    month: number;
    year: number;
  }): Promise<void> {
    if (editingBudget) {
      await updateBudget(editingBudget._id, { monthlyLimit: data.monthlyLimit });
    } else {
      await createBudget(data);
    }
    closeModal();
    await refetch();
  }

  async function handleDelete(id: string): Promise<void> {
    await deleteBudget(id);
    await refetch();
  }

  const selectClass =
    "rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className={selectClass}
            aria-label="Select month"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={selectClass}
            aria-label="Select year"
          >
            <option value={now.getFullYear()}>{now.getFullYear()}</option>
            <option value={now.getFullYear() - 1}>{now.getFullYear() - 1}</option>
          </select>

          <Button onClick={openAddModal}>Set Budget</Button>
        </div>
      </div>

      <BudgetAlertBanner alerts={budgetAlerts} />

      <BudgetList
        budgets={budgets}
        spentByCategory={spentByCategory}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onAddBudget={openAddModal}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingBudget ? "Edit Budget" : "Set Budget"}
      >
        <BudgetForm
          initialData={editingBudget ?? undefined}
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          existingCategories={existingCategories}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
