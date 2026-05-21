import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { Expense, type IExpenseDocument } from "@/models/Expense";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { buildCSV } from "@/lib/csv";

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<Response> => {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const userId = new mongoose.Types.ObjectId(req.userId);
    const match: Record<string, unknown> = { userId };

    let filename = "expenses-all.csv";

    if (monthParam && yearParam) {
      const month = parseInt(monthParam, 10);
      const year = parseInt(yearParam, 10);
      if (month >= 1 && month <= 12 && year > 0) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        match.date = { $gte: startOfMonth, $lte: endOfMonth };
        filename = `expenses-${year}-${String(month).padStart(2, "0")}.csv`;
      }
    } else if (monthParam) {
      const month = parseInt(monthParam, 10);
      if (month >= 1 && month <= 12) {
        match.$expr = { $eq: [{ $month: "$date" }, month] };
        filename = `expenses-month-${String(month).padStart(2, "0")}.csv`;
      }
    } else if (yearParam) {
      const year = parseInt(yearParam, 10);
      if (year > 0) {
        match.date = { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) };
        filename = `expenses-${year}.csv`;
      }
    }

    const expenses = await Expense.find(match).sort({ date: -1 }).lean();
    const csvString = buildCSV(expenses as IExpenseDocument[]);

    return new Response(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
});
