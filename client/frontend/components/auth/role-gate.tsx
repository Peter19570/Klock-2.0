"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { getAllowedRoles, getLandingRoute } from "@/lib/auth/rbac";
import { Spinner } from "@/components/ui/spinner";

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

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size={40} />
      </div>
    );
  }

  if (status === "unauthenticated") return null;
  if (isRoleBlocked) return null;

  return <>{children}</>;
}
