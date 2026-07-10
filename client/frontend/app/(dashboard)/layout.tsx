"use client";

import { RoleGate } from "@/components/auth/role-gate";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { PanelSidebar } from "@/components/layout/panel-sidebar";
import { ForcePasswordChangeDialog } from "@/features/auth/components/force-password-change-dialog";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = useAuthStore((s) => s.user?.userRole);
  const isPanelUser = role === "ADMIN" || role === "SUPER_ADMIN";

  return (
    <ThemeProvider>
      <RoleGate>
        <ForcePasswordChangeDialog />
        {isPanelUser ? (
          <>
            <PanelSidebar />
            <Navbar fullWidth />
            <main className="px-4 pt-16 sm:px-6 md:pl-18 md:pr-6">
              {children}
            </main>
          </>
        ) : (
          <>
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
              {children}
            </main>
          </>
        )}
      </RoleGate>
    </ThemeProvider>
  );
}
