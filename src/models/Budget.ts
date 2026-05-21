import mongoose, { Schema } from "mongoose";
import { CATEGORIES, type Category } from "@/types/index";

export interface IBudgetDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  category: Category;
  monthlyLimit: number;
  month: number;
  year: number;
  createdAt: Date;
}

const BudgetSchema = new Schema<IBudgetDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    monthlyLimit: { type: Number, required: true, min: 1 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, month: 1, year: 1 });
BudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export const Budget =
  mongoose.models.Budget ??
  mongoose.model<IBudgetDocument>("Budget", BudgetSchema);
