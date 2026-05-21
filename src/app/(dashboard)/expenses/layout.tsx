import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Expenses" };

export default function ExpensesPageLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
