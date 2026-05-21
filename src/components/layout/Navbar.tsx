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
    <>
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
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            Logout
          </Button>
        </div>
      </header>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { if (!loggingOut) setConfirming(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Log out?</h2>
                <p className="mt-1 text-sm text-gray-500">Are you sure you want to log out of your account?</p>
              </div>
              <div className="flex w-full gap-3 mt-1">
                <Button
                  variant="ghost"
                  className="flex-1"
                  disabled={loggingOut}
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  loading={loggingOut}
                  onClick={() => void handleLogout()}
                >
                  Yes, log out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
