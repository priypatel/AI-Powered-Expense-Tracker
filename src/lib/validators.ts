import { CATEGORIES, type Category } from "@/types/index";

export interface ValidExpenseData {
  amount: number;
  category: Category;
  date: Date;
  note?: string;
}

type ValidationError = { error: string };

export function validateExpenseBody(
  body: unknown
): ValidExpenseData | ValidationError {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid request body" };
  }

  const b = body as Record<string, unknown>;

  // amount
  if (b.amount === undefined || b.amount === null || b.amount === "") {
    return { error: "Amount is required" };
  }
  const amount = Number(b.amount);
  if (!isFinite(amount) || amount <= 0) {
    return { error: "Amount must be a positive number" };
  }

  // category
  if (b.category === undefined || b.category === null || b.category === "") {
    return { error: "Category is required" };
  }
  if (!CATEGORIES.includes(b.category as Category)) {
    return { error: "Invalid category" };
  }

  // date
  if (b.date === undefined || b.date === null || b.date === "") {
    return { error: "Date is required" };
  }
  const date = new Date(String(b.date));
  if (isNaN(date.getTime())) {
    return { error: "Invalid date" };
  }

  // note (optional)
  let note: string | undefined;
  if (b.note !== undefined && b.note !== null) {
    note = String(b.note).trim();
    if (note.length > 200) {
      return { error: "Note must be 200 characters or fewer" };
    }
  }

  return {
    amount,
    category: b.category as Category,
    date,
    ...(note !== undefined && { note }),
  };
}
