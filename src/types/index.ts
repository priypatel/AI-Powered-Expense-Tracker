export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
  "Housing",
  "Education",
  "Travel",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#f97316",
  Transport: "#3b82f6",
  Shopping: "#a855f7",
  Entertainment: "#ec4899",
  Health: "#22c55e",
  Utilities: "#eab308",
  Housing: "#6366f1",
  Education: "#14b8a6",
  Travel: "#f43f5e",
  Other: "#94a3b8",
};

export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface IExpense {
  _id: string;
  userId: string;
  amount: number;
  category: Category;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBudget {
  _id: string;
  userId: string;
  category: Category;
  monthlyLimit: number;
  month: number;
  year: number;
  createdAt: string;
}

export interface DashboardStats {
  totalThisMonth: number;
  expenseCount: number;
  categoryBreakdown: { category: string; total: number }[];
  monthlyTrend: { label: string; total: number }[];
  budgetAlerts: { category: string; spent: number; limit: number; pct: number }[];
}

export interface ApiError {
  error: string;
}

export interface PaginatedExpenses {
  expenses: IExpense[];
  total: number;
  page: number;
  totalPages: number;
}
