import { NextResponse } from "next/server";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { extractExpenseFromText } from "@/lib/gemini";

export const POST = withAuth(async (req: AuthenticatedRequest): Promise<Response> => {
  const body = (await req.json()) as { text?: unknown };

  if (typeof body.text !== "string" || !body.text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (body.text.trim().length < 5) {
    return NextResponse.json({ error: "Text too short to extract from" }, { status: 400 });
  }

  try {
    const data = await extractExpenseFromText(body.text);
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.message === "timeout") {
      return NextResponse.json(
        { error: "AI request timed out — please try again" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: "AI extraction failed — please fill in manually" },
      { status: 422 }
    );
  }
});
