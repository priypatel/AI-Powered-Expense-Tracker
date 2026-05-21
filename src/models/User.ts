import mongoose, { Schema } from "mongoose";

export interface IUserDocument extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User =
  mongoose.models.User ?? mongoose.model<IUserDocument>("User", UserSchema);
