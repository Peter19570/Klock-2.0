import {
  LayoutDashboard,
  MapPin,
  Users,
  FileClock,
  Building2,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import type { components } from "@/lib/api/generated/schema";

type UserRole = NonNullable<components["schemas"]["UserResponse"]["userRole"]>;

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export const PANEL_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Live Map",
    href: "/live-map",
    icon: MapPin,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Sessions",
    href: "/sessions",
    icon: FileClock,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Branches",
    href: "/branches",
    icon: Building2,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Audit Logs",
    href: "/audits",
    icon: ShieldAlert,
    roles: ["SUPER_ADMIN"], // hidden from ADMIN
  },
];

export function getNavItemsForRole(role: UserRole | undefined): NavItem[] {
  if (!role) return [];
  return PANEL_NAV_ITEMS.filter((item) => item.roles.includes(role));
}