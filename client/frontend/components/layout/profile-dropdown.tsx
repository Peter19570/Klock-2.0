"use client";

import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AnimatedThemeToggle } from "@/components/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileModal } from "@/features/users/components/profile-modal";

const ROLE_LABELS: Record<string, string> = {
  USER: "Employee",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function Avatar({
  picture,
  firstName,
  lastName,
  size = 32,
}: {
  picture?: string;
  firstName?: string;
  lastName?: string;
  size?: number;
}) {
  if (picture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={picture}
        alt=""
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-xs font-semibold text-primary-foreground"
      style={{ width: size, height: size }}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}

export function ProfileDropdown() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleSignOut() {
    // fire the revoke request but don't block on it — clear + redirect immediately.
    // route.ts still revokes server-side before clearing the cookie; a failed
    // revoke here just means the refresh token expires naturally later.
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearAuth();
    router.push("/login");
  }

  if (!user) return null;

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const roleLabel = ROLE_LABELS[user.userRole ?? ""] ?? user.userRole;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-border/60 bg-card/60 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-accent">
          <Avatar
            picture={user.picture}
            firstName={user.firstName}
            lastName={user.lastName}
          />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-tight text-foreground">
              {fullName}
            </span>
            <span className="block text-xs leading-tight text-muted-foreground">
              {user.email}
            </span>
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-64 border-border/60 bg-popover/90 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 p-2">
            <Avatar
              picture={user.picture}
              firstName={user.firstName}
              lastName={user.lastName}
              size={40}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 pb-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {roleLabel}
            </span>
            <AnimatedThemeToggle />
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" /> Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
