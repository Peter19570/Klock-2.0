"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUpDown, LogOut, Settings, UserCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { getNavItemsForRole } from "@/config/nav";

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.05rem" },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

// label slide/fade-in animation — now actually used below
const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { x: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: { x: { stiffness: 100 } },
  },
};

const transitionProps = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.2,
};

const staggerVariants = {
  open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

function AccountBlock({
  isCollapsed,
  name,
  email,
  initials,
}: {
  isCollapsed: boolean;
  name?: string;
  email?: string;
  initials: string;
}) {
  return (
    <div className="flex flex-col p-2">
      <Link
        href="/settings/profile"
        className="flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Settings className="h-4 w-4 shrink-0" />
        <motion.span variants={variants}>
          {!isCollapsed && <p className="ml-2 text-sm font-medium">Settings</p>}
        </motion.span>
      </Link>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="w-full">
          <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Avatar className="size-4">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <motion.span
              variants={variants}
              className="flex w-full items-center gap-2"
            >
              {!isCollapsed && (
                <>
                  <p className="text-sm font-medium">{name ?? "Account"}</p>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-(--sidebar-foreground)/50" />
                </>
              )}
            </motion.span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={5}>
          <div className="flex flex-row items-center gap-2 p-2">
            <Avatar className="size-6">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium">{name}</span>
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {email}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0">
            <Link
              href="/settings/profile"
              className="flex w-full items-center gap-2 px-2 py-2"
            >
              <UserCircle className="h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            {/* TODO: wire to your actual logout mutation from features/auth/api.ts */}
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function NavLinks({
  isCollapsed,
  onNavigate,
}: {
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.userRole);
  const navItems = getNavItemsForRole(role);

  return (
    <div className="flex w-full flex-col gap-1">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-accent text-sidebar-primary",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <motion.span variants={variants}>
              {!isCollapsed && (
                <p className="ml-2 text-sm font-medium">{label}</p>
              )}
            </motion.span>
          </Link>
        );
      })}
    </div>
  );
}

export function PanelSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isMobileOpen = useUIStore((s) => s.isPanelSidebarOpen);
  const closeMobile = useUIStore((s) => s.closePanelSidebar);

  const name = useAuthStore((s) => s.user?.firstName);
  const email = useAuthStore((s) => s.user?.email);
  const initials = name?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      {/* Desktop: hover-expand column */}
      <motion.div
        className="sidebar fixed left-0 top-0 z-50 hidden h-full shrink-0 border-r border-sidebar-border md:block"
        initial={isCollapsed ? "closed" : "open"}
        animate={isCollapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={transitionProps}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <motion.div
          className="relative z-50 flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all"
          variants={contentVariants}
        >
          <motion.ul
            variants={staggerVariants}
            className="flex h-full flex-col"
          >
            <div className="flex grow flex-col items-center">
              <div className="flex h-13.5 w-full shrink-0 items-center border-b border-sidebar-border p-2">
                <div className="mt-[1.5px] flex w-full items-center gap-2 px-2">
                  <Avatar className="size-6 rounded">
                    <AvatarFallback>K</AvatarFallback>
                  </Avatar>
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="text-sm font-medium">Klock</p>
                    )}
                  </motion.li>
                </div>
              </div>

              <div className="flex h-full w-full flex-col">
                <div className="flex grow flex-col gap-4">
                  <ScrollArea className="h-16 grow p-2">
                    <NavLinks isCollapsed={isCollapsed} />
                  </ScrollArea>
                </div>
                <AccountBlock
                  isCollapsed={isCollapsed}
                  name={name}
                  email={email}
                  initials={initials}
                />
              </div>
            </div>
          </motion.ul>
        </motion.div>
      </motion.div>

      {/* Mobile: slide-in drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />
            <motion.div
              key="drawer"
              className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
            >
              <div className="flex h-13.5 w-full shrink-0 items-center justify-between border-b border-sidebar-border p-2 px-3">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6 rounded">
                    <AvatarFallback>K</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">Klock</p>
                </div>
                <button onClick={closeMobile} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex grow flex-col gap-4">
                <ScrollArea className="grow p-2">
                  <NavLinks isCollapsed={false} onNavigate={closeMobile} />
                </ScrollArea>
              </div>
              <AccountBlock
                isCollapsed={false}
                name={name}
                email={email}
                initials={initials}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
