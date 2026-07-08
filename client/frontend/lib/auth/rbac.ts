import type { components } from "@/lib/api/generated/schema";

type UserRole = NonNullable<components["schemas"]["UserResponse"]["userRole"]>;

export function getLandingRoute(role: UserRole): string {
  switch (role) {
    case "USER":
      return "/attendance";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/dashboard";
  }
}

export const ROUTE_ROLES: Record<string, UserRole[]> = {
  "/dashboard": ["ADMIN", "SUPER_ADMIN"],
  "/attendance": ["USER"],
  "/sessions": ["USER", "ADMIN", "SUPER_ADMIN"],
  "/branches": ["ADMIN", "SUPER_ADMIN"],
  "/users": ["ADMIN", "SUPER_ADMIN"],
  "/organization": ["SUPER_ADMIN"],
  "/audits": ["SUPER_ADMIN"],
  "/settings": ["USER", "ADMIN", "SUPER_ADMIN"]
};

export function getAllowedRoles(pathname: string): UserRole[] | null {
  const match = Object.keys(ROUTE_ROLES).find((prefix) => pathname.startsWith(prefix));
  return match ? ROUTE_ROLES[match] : null;
}