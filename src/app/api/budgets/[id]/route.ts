import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { Budget } from "@/models/Budget";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";

type RouteCtx = { params: Record<string, string> };

export const PUT = withAuth(async (req: AuthenticatedRequest, ctx: RouteCtx): Promise<Response> => {
  try {
    await connectDB();

    const { id } = ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid budget ID" }, { status: 400 });
    }

    const budget = await Budget.findById(id);
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }
    if (budget.userId.toString() !== req.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as { monthlyLimit?: unknown };
    const monthlyLimit = Number(body.monthlyLimit);
    if (!isFinite(monthlyLimit) || monthlyLimit < 1) {
      return NextResponse.json({ error: "Monthly limit must be at least ₹1" }, { status: 400 });
    }

    budget.monthlyLimit = monthlyLimit;
    await budget.save();

    return NextResponse.json({ budget }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, ctx: RouteCtx): Promise<Response> => {
  try {
    await connectDB();

    const { id } = ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid budget ID" }, { status: 400 });
    }

    const budget = await Budget.findById(id);
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }
    if (budget.userId.toString() !== req.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await budget.deleteOne();

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
