import { GoogleGenerativeAI } from "@google/generative-ai";
import { CATEGORIES, type Category } from "@/types/index";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface ExtractedExpense {
  amount: number | null;
  category: Category;
  date: string;
  note: string;
}

export async function extractExpenseFromText(text: string): Promise<ExtractedExpense> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const today = new Date().toISOString().split("T")[0];

  const prompt = `
You are an expense extraction assistant. From the following text, extract:
- amount (number only, no currency symbol, e.g. 45.50)
- category (must be exactly one of: Food, Transport, Shopping, Entertainment, Health, Utilities, Housing, Education, Travel, Other)
- date (ISO 8601 format YYYY-MM-DD; infer from context, or use today's date ${today} if not mentioned)
- note (short description of the expense, max 80 characters)

Rules:
1. Respond ONLY with a single valid JSON object. No explanation, no markdown, no code blocks.
2. If you cannot determine the amount, set amount to null.
3. If category is ambiguous, choose closest match or "Other".
4. Do not include currency symbols in amount.
5. If multiple expenses appear in the text, extract only the most prominent/total one.

Example response: {"amount": 45.50, "category": "Food", "date": "${today}", "note": "Lunch at restaurant"}

Text:
"""
${text}
"""`.trim();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), 10_000)
  );

  const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);

  const raw = result.response.text();

  const cleaned = raw
    .replace(/```(?:json)?\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  let amount: number | null;
  const rawAmount = parsed.amount;
  if (typeof rawAmount === "number") {
    amount = rawAmount;
  } else if (typeof rawAmount === "string") {
    const n = parseFloat(rawAmount.replace(/[^\d.]/g, ""));
    amount = isNaN(n) ? null : n;
  } else {
    amount = null;
  }

  const rawCategory = String(parsed.category ?? "");
  const category: Category = (CATEGORIES as readonly string[]).includes(rawCategory)
    ? (rawCategory as Category)
    : "Other";

  const rawDate = String(parsed.date ?? "");
  const date = isNaN(new Date(rawDate).getTime()) ? today : rawDate;

  const note = String(parsed.note ?? "").slice(0, 80);

  return { amount, category, date, note };
}
