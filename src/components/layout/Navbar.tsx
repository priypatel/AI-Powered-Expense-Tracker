"use client";

import { useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps): JSX.Element {
  const { user, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirming(false);
    }
  }

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

        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Log out?</span>
            <Button
              size="sm"
              variant="danger"
              loading={loggingOut}
              onClick={() => void handleLogout()}
            >
              Yes, log out
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={loggingOut}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
