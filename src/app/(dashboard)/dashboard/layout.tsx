import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPageLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
