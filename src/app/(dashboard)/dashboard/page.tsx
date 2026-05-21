import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Expense Tracker",
  description: "Overview of your expenses and budget",
};

export default function DashboardPage(): JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Your expense overview</p>
    </div>
  );
}
