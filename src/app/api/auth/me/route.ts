import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { withAuth, AuthenticatedRequest } from "@/lib/withAuth";

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<Response> => {
  await connectDB();
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { user: { _id: user._id, name: user.name, email: user.email } },
    { status: 200 }
  );
});
