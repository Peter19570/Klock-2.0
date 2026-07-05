import Link from "next/link";
import { KlockLogo } from "@/components/brand/klock-logo";
import { AnimatedThemeToggle } from "@/components/theme/theme-toggle";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard">
          <KlockLogo />
        </Link>
        <div className="flex items-center gap-3">
          <AnimatedThemeToggle className="hidden sm:inline-flex" />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}