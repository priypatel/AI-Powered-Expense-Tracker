import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { Budget } from "@/models/Budget";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { CATEGORIES, type Category } from "@/types/index";

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<Response> => {
  try {
    await connectDB();

    const userId = new mongoose.Types.ObjectId(req.userId);
    const { searchParams } = req.nextUrl;
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const filter: Record<string, unknown> = { userId };

    if (monthParam && yearParam) {
      const month = parseInt(monthParam, 10);
      const year = parseInt(yearParam, 10);
      if (!isNaN(month) && !isNaN(year)) {
        filter.month = month;
        filter.year = year;
      }
    }

    const budgets = await Budget.find(filter).sort({ category: 1 }).lean();
    return NextResponse.json({ budgets }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest): Promise<Response> => {
  try {
    await connectDB();

    const userId = new mongoose.Types.ObjectId(req.userId);
    const body = (await req.json()) as {
      category?: unknown;
      monthlyLimit?: unknown;
      month?: unknown;
      year?: unknown;
    };

    if (typeof body.category !== "string" || !CATEGORIES.includes(body.category as Category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const monthlyLimit = Number(body.monthlyLimit);
    if (!isFinite(monthlyLimit) || monthlyLimit < 1) {
      return NextResponse.json({ error: "Monthly limit must be at least ₹1" }, { status: 400 });
    }

    const month = Number(body.month);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Month must be between 1 and 12" }, { status: 400 });
    }

    const year = Number(body.year);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId, category: body.category, month, year },
      { $set: { monthlyLimit } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ budget }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
