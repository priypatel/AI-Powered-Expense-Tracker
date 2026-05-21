"use client";

import { useAuth } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps): JSX.Element {
  const { user, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-10 flex h-16 items-center border-b border-gray-200 bg-white px-4 md:left-64">
      <button
        onClick={onMenuClick}
        className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex flex-1 items-center justify-end gap-4">
        {user && (
          <span className="hidden text-sm text-gray-600 sm:block">{user.name}</span>
        )}
        <Button variant="ghost" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
