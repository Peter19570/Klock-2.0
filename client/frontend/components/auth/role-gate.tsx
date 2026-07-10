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
  const isRoleBlocked =
    !!allowedRoles && !!role && !allowedRoles.includes(role);

  useEffect(() => {
    if (status === "idle" || status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (status === "authenticated" && role && isRoleBlocked) {
      router.replace(getLandingRoute(role));
    }
  }, [status, role, isRoleBlocked, pathname, router]);

  if (status === "idle" || status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return null;
  if (isRoleBlocked) return null;

  return <>{children}</>;
}