"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.088-3.535M6.34 6.34A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.05 10.05 0 01-2.458 3.815M6.34 6.34L3 3m3.34 3.34l11.32 11.32M17.66 17.66L21 21" />
    </svg>
  );
}

export function LoginForm(): JSX.Element {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {errors.form && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {errors.form}
        </p>
      )}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
        error={errors.email}
        disabled={loading}
        aria-required="true"
      />
      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
        error={errors.password}
        disabled={loading}
        aria-required="true"
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        }
      />
      <Button type="submit" loading={loading} className="w-full mt-2">
        Sign in
      </Button>
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline font-medium">
          Register
        </Link>
      </p>
    </form>
  );
}
