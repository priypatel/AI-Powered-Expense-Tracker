"use client";

import { useState, useCallback } from "react";
import type { IExpense } from "@/types/index";

interface ExpenseFilters {
  category?: string;
  month?: number;
  year?: number;
  page?: number;
}

interface UseExpensesReturn {
  expenses: IExpense[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchExpenses: (filters?: ExpenseFilters) => Promise<void>;
  createExpense: (data: {
    amount: number;
    category: string;
    date: string;
    note?: string;
  }) => Promise<void>;
  updateExpense: (
    id: string,
    data: Partial<{ amount: number; category: string; date: string; note: string }>
  ) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (filters?: ExpenseFilters): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.set("category", filters.category);
      if (filters?.month) params.set("month", String(filters.month));
      if (filters?.year) params.set("year", String(filters.year));
      if (filters?.page) params.set("page", String(filters.page));

      const res = await fetch(`/api/expenses?${params.toString()}`);
      const data = (await res.json()) as
        | { expenses: IExpense[]; total: number; page: number; totalPages: number }
        | { error: string };

      if (!res.ok) {
        const msg = "error" in data ? data.error : "Failed to fetch expenses";
        throw new Error(msg);
      }

      if ("expenses" in data) {
        setExpenses(data.expenses);
        setTotal(data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpense = useCallback(
    async (data: {
      amount: number;
      category: string;
      date: string;
      note?: string;
    }): Promise<void> => {
      setError(null);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        const msg = json.error ?? "Failed to create expense";
        setError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  const updateExpense = useCallback(
    async (
      id: string,
      data: Partial<{ amount: number; category: string; date: string; note: string }>
    ): Promise<void> => {
      setError(null);
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        const msg = json.error ?? "Failed to update expense";
        setError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  const deleteExpense = useCallback(async (id: string): Promise<void> => {
    setError(null);
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      const msg = json.error ?? "Failed to delete expense";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  return {
    expenses,
    total,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
