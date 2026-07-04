"use client";

import { useAuthStore } from "@/store/auth-store";

export default function AttendancePage() {
  const user = useAuthStore((s) => s.user);
  return <p>Logged in as {user?.firstName} — role: {user?.userRole}</p>;
}