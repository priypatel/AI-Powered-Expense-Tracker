import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { Expense } from "@/models/Expense";
import { Budget } from "@/models/Budget";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import type { Category } from "@/types/index";

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

interface TotalAggResult {
  _id: null;
  total: number;
  count: number;
}

interface CategoryAggResult {
  _id: string;
  total: number;
}

interface TrendAggResult {
  _id: { year: number; month: number };
  total: number;
}

interface LeanBudget {
  category: Category;
  monthlyLimit: number;
}

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<Response> => {
  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const userId = new mongoose.Types.ObjectId(req.userId);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [totalRes, categoryRes, trendRes, budgetDocs] = await Promise.all([
      Expense.aggregate<TotalAggResult>([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate<CategoryAggResult>([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate<TrendAggResult>([
        { $match: { userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: "$date" }, month: { $month: "$date" } },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Budget.find({
        userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      }).lean<LeanBudget[]>(),
    ]);

    const totalThisMonth = totalRes[0]?.total ?? 0;
    const expenseCount = totalRes[0]?.count ?? 0;

    const categoryBreakdown = categoryRes.map((item) => ({
      category: item._id,
      total: item.total,
    }));

    const trendMap = new Map<string, number>();
    for (const item of trendRes) {
      trendMap.set(`${item._id.year}-${item._id.month}`, item.total);
    }
    const monthlyTrend: { label: string; total: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - 5 + i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthlyTrend.push({
        label: MONTH_ABBR[d.getMonth()],
        total: trendMap.get(key) ?? 0,
      });
    }

    const budgetAlerts = budgetDocs.map((budget) => {
      const spent = categoryBreakdown.find((c) => c.category === budget.category)?.total ?? 0;
      const pct = Math.round((spent / budget.monthlyLimit) * 100);
      return { category: budget.category, spent, limit: budget.monthlyLimit, pct };
    });

    return NextResponse.json(
      { totalThisMonth, expenseCount, categoryBreakdown, monthlyTrend, budgetAlerts },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
});
