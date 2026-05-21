import { NextResponse } from "next/server";
import { clearCookie } from "@/lib/auth";

export async function POST(): Promise<Response> {
  const response = NextResponse.json({ message: "Logged out" }, { status: 200 });
  clearCookie(response);
  return response;
}
