import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Budget" };

export default function BudgetPageLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
