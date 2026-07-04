"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { getAllowedRoles, getLandingRoute } from "@/lib/auth/rbac";

export function RoleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.user?.userRole);

  const allowedRoles = getAllowedRoles(pathname);
  const isBlocked = !!allowedRoles && !!role && !allowedRoles.includes(role);

  useEffect(() => {
    if (status !== "authenticated" || !role) return;
    if (isBlocked) router.replace(getLandingRoute(role));
  }, [status, role, isBlocked, router]);

  if (status === "idle" || status === "loading") return <p>Loading...</p>;
  if (isBlocked) return null; // redirect in flight — don't flash protected content

  return <>{children}</>;
}