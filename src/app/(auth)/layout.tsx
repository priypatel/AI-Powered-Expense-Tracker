import { AuthProvider } from "@/components/layout/AuthProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}
