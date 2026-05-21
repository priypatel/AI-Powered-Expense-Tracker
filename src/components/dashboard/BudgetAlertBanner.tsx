import type { JSX } from "react";

interface Alert {
  category: string;
  spent: number;
  limit: number;
  pct: number;
}

interface BudgetAlertBannerProps {
  alerts: Alert[];
}

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BudgetAlertBanner({ alerts }: BudgetAlertBannerProps): JSX.Element | null {
  const visible = alerts.filter((a) => a.pct >= 80);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {visible.map((alert) => {
        const over = alert.pct >= 100;
        return (
          <div
            key={alert.category}
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              over
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-yellow-50 text-yellow-800 border border-yellow-200"
            }`}
          >
            {over ? "⚠" : "⚡"}{" "}
            {alert.category}: {formatINR(alert.spent)} / {formatINR(alert.limit)} —{" "}
            {over ? `Over budget! (${alert.pct}%)` : `Near limit (${alert.pct}%)`}
          </div>
        );
      })}
    </div>
  );
}
