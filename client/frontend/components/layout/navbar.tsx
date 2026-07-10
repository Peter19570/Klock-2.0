"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { KlockLogo } from "@/components/brand/klock-logo";
import { AnimatedThemeToggle } from "@/components/theme/theme-toggle";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { useUIStore } from "@/store/ui-store";

export function Navbar({ fullWidth = false }: { fullWidth?: boolean }) {
  const togglePanelSidebar = useUIStore((s) => s.togglePanelSidebar);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/60",
        fullWidth && "md:pl-[3.05rem]", // clears the collapsed PanelSidebar column on desktop only
      )}
    >
      <div
        className={cn(
          "relative flex h-16 items-center px-4 sm:px-6",
          !fullWidth && "mx-auto max-w-6xl justify-between",
        )}
      >
        {fullWidth ? (
          <>
            {/* mobile: hamburger left */}
            <button
              onClick={togglePanelSidebar}
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* mobile: logo centered */}
            <Link
              href="/dashboard"
              className="absolute left-1/2 -translate-x-1/2 md:hidden"
            >
              <KlockLogo />
            </Link>

            {/* desktop: theme toggle, then profile pinned to the far right */}
            <div className="hidden items-center gap-3 md:ml-auto md:flex">
              <AnimatedThemeToggle className="hidden sm:inline-flex" />
              <ProfileDropdown />
            </div>

            {/* mobile: profile right */}
            <div className="ml-auto flex items-center gap-3 md:hidden">
              <ProfileDropdown />
            </div>
          </>
        ) : (
          <>
            <Link href="/dashboard">
              <KlockLogo />
            </Link>
            <div className="flex items-center gap-3">
              <AnimatedThemeToggle className="hidden sm:inline-flex" />
              <ProfileDropdown />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
