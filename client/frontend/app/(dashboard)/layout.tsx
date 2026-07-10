"use client";

import { RoleGate } from "@/components/auth/role-gate";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { ForcePasswordChangeDialog } from "@/features/auth/components/force-password-change-dialog";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RoleGate>
        <Navbar />
        <ForcePasswordChangeDialog />
        <main className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">{children}</main>
      </RoleGate>
    </ThemeProvider>
  );
}