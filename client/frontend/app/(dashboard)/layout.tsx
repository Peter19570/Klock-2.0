"use client";

import { RoleGate } from "@/components/auth/role-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate>{children}</RoleGate>;
}