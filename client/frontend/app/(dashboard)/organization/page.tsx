"use client";

import { useAuthStore } from "@/store/auth-store";

export default function OrganizationPage() {
  const user = useAuthStore((s) => s.user);
  return <p>Org settings — role: {user?.userRole}</p>;
}
