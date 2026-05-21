import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { comparePassword, signJWT, setCookie } from "@/lib/auth";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = (await req.json()) as { email?: unknown; password?: unknown };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(String(password), user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signJWT({ userId: user._id.toString(), email: user.email });
    const response = NextResponse.json(
      { user: { _id: user._id, name: user.name, email: user.email } },
      { status: 200 }
    );
    setCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
