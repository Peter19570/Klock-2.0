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