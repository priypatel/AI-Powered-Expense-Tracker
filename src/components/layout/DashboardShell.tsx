"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
      <main className="pt-16 md:pl-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
