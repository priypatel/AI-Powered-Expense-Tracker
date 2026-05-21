"use client";

import { CATEGORIES } from "@/types/index";

export interface FilterState {
  category: string;
  month: number | "";
  year: number | "";
}

interface ExpenseFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function ExpenseFilters({ filters, onChange }: ExpenseFiltersProps): JSX.Element {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  const selectClass =
    "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className={selectClass}
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        value={filters.month}
        onChange={(e) =>
          onChange({ ...filters, month: e.target.value === "" ? "" : Number(e.target.value) })
        }
        className={selectClass}
        aria-label="Filter by month"
      >
        <option value="">All Months</option>
        {MONTH_NAMES.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={filters.year}
        onChange={(e) =>
          onChange({ ...filters, year: e.target.value === "" ? "" : Number(e.target.value) })
        }
        className={selectClass}
        aria-label="Filter by year"
      >
        <option value="">All Years</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
