import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { Expense } from "@/models/Expense";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";
import { CATEGORIES, type Category } from "@/types/index";

type RouteCtx = { params: Record<string, string> };

export const PUT = withAuth(
  async (req: AuthenticatedRequest, ctx: RouteCtx): Promise<Response> => {
    try {
      await connectDB();
      const { id } = ctx.params;

      let expense;
      try {
        expense = await Expense.findById(id);
      } catch {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
      }

      if (!expense) {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
      }
      if (expense.userId.toString() !== req.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const body = (await req.json()) as Record<string, unknown>;

      if ("amount" in body) {
        const amount = Number(body.amount);
        if (!isFinite(amount) || amount <= 0) {
          return NextResponse.json(
            { error: "Amount must be a positive number" },
            { status: 400 }
          );
        }
        expense.amount = amount;
      }

      if ("category" in body) {
        if (!CATEGORIES.includes(body.category as Category)) {
          return NextResponse.json({ error: "Invalid category" }, { status: 400 });
        }
        expense.category = body.category as Category;
      }

      if ("date" in body) {
        const d = new Date(String(body.date));
        if (isNaN(d.getTime())) {
          return NextResponse.json({ error: "Invalid date" }, { status: 400 });
        }
        expense.date = d;
      }

      if ("note" in body) {
        const note = String(body.note ?? "").trim();
        if (note.length > 200) {
          return NextResponse.json(
            { error: "Note must be 200 characters or fewer" },
            { status: 400 }
          );
        }
        expense.note = note;
      }

      await expense.save();
      return NextResponse.json({ expense }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const DELETE = withAuth(
  async (req: AuthenticatedRequest, ctx: RouteCtx): Promise<Response> => {
    try {
      await connectDB();
      const { id } = ctx.params;

      let expense;
      try {
        expense = await Expense.findById(id);
      } catch {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
      }

      if (!expense) {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
      }
      if (expense.userId.toString() !== req.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await Expense.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
      return NextResponse.json({ message: "Deleted" }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
