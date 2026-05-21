import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/auth";

export default function RootPage(): never {
  const token = cookies().get("token")?.value;
  if (token) {
    try {
      verifyJWT(token);
      redirect("/dashboard");
    } catch {
      // token invalid — fall through to login
    }
  }
  redirect("/login");
}
