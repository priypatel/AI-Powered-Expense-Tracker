"use client";

import { useState, useCallback } from "react";
import type { IBudget } from "@/types/index";

interface BudgetCreateData {
  category: string;
  monthlyLimit: number;
  month: number;
  year: number;
}

interface UseBudgetsReturn {
  budgets: IBudget[];
  loading: boolean;
  error: string | null;
  fetchBudgets: (month?: number, year?: number) => Promise<void>;
  createBudget: (data: BudgetCreateData) => Promise<void>;
  updateBudget: (id: string, data: { monthlyLimit: number }) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export function useBudgets(): UseBudgetsReturn {
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async (month?: number, year?: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (month !== undefined) params.set("month", String(month));
      if (year !== undefined) params.set("year", String(year));
      const res = await fetch(`/api/budgets?${params.toString()}`);
      const data = (await res.json()) as { budgets?: IBudget[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch budgets");
      setBudgets(data.budgets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch budgets");
    } finally {
      setLoading(false);
    }
  }, []);

  const createBudget = useCallback(async (data: BudgetCreateData): Promise<void> => {
    setError(null);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      const msg = json.error ?? "Failed to create budget";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const updateBudget = useCallback(async (id: string, data: { monthlyLimit: number }): Promise<void> => {
    setError(null);
    const res = await fetch(`/api/budgets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      const msg = json.error ?? "Failed to update budget";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const deleteBudget = useCallback(async (id: string): Promise<void> => {
    setError(null);
    const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      const msg = json.error ?? "Failed to delete budget";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  return { budgets, loading, error, fetchBudgets, createBudget, updateBudget, deleteBudget };
}
