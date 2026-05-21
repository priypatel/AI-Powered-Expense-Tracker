import type { IExpenseDocument } from "@/models/Expense";

function escapeCSVField(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCSV(expenses: IExpenseDocument[]): string {
  const header = "Date,Category,Amount,Note";
  const rows = expenses.map((expense) => {
    const date = expense.date.toISOString().split("T")[0];
    const category = escapeCSVField(expense.category);
    const amount = expense.amount.toFixed(2);
    const note = escapeCSVField(expense.note ?? "");
    return `${date},${category},${amount},${note}`;
  });
  return [header, ...rows].join("\n");
}
