import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/auth";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { ToastProvider } from "@/components/layout/ToastProvider";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const token = cookies().get("token")?.value;
  if (!token) redirect("/login");

  try {
    verifyJWT(token);
  } catch {
    redirect("/login");
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <DashboardShell>{children}</DashboardShell>
      </ToastProvider>
    </AuthProvider>
  );
}
