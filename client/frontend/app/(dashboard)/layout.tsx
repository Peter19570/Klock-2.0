"use client";

import { useAuthStore } from "@/store/auth-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  if (status === "idle" || status === "loading") return <p>Loading...</p>;
  return <div>{children}</div>;
}