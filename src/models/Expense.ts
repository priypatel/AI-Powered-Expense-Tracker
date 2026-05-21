import mongoose, { Schema } from "mongoose";
import { CATEGORIES, type Category } from "@/types/index";

export interface IExpenseDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  category: Category;
  date: Date;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, enum: CATEGORIES, required: true },
    date: { type: Date, required: true },
    note: { type: String, maxlength: 200, default: "" },
  },
  { timestamps: true }
);

ExpenseSchema.index({ userId: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });

export const Expense =
  mongoose.models.Expense ??
  mongoose.model<IExpenseDocument>("Expense", ExpenseSchema);
