import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { Expense } from "@/models/Expense";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { validateExpenseBody } from "@/lib/validators";
import { CATEGORIES, type Category } from "@/types/index";

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<Response> => {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const categoryParam = searchParams.get("category");
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") ?? "10", 10) || 10)
    );

    const userId = new mongoose.Types.ObjectId(req.userId);
    const match: Record<string, unknown> = { userId };

    if (categoryParam && CATEGORIES.includes(categoryParam as Category)) {
      match.category = categoryParam;
    }

    if (monthParam && yearParam) {
      // Both selected — filter exact month within that year
      const month = parseInt(monthParam, 10);
      const year = parseInt(yearParam, 10);
      if (month >= 1 && month <= 12 && year > 0) {
        match.date = {
          $gte: new Date(year, month - 1, 1),
          $lte: new Date(year, month, 0, 23, 59, 59),
        };
      }
    } else if (yearParam) {
      // Year only — filter the entire calendar year
      const year = parseInt(yearParam, 10);
      if (year > 0) {
        match.date = {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31, 23, 59, 59),
        };
      }
    } else if (monthParam) {
      // Month only — match that month across all years
      const month = parseInt(monthParam, 10);
      if (month >= 1 && month <= 12) {
        match.$expr = { $eq: [{ $month: "$date" }, month] };
      }
    }

    const [total, expenses] = await Promise.all([
      Expense.countDocuments(match),
      Expense.find(match)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json(
      { expenses, total, page, totalPages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest): Promise<Response> => {
  try {
    await connectDB();

    const body = (await req.json()) as unknown;
    const validated = validateExpenseBody(body);

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const expense = await Expense.create({
      userId: new mongoose.Types.ObjectId(req.userId),
      ...validated,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
