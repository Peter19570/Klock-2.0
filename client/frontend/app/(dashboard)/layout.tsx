"use client";

import { RoleGate } from "@/components/auth/role-gate";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RoleGate>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 sm:px-6">{children}</main>
      </RoleGate>
    </ThemeProvider>
  );
}