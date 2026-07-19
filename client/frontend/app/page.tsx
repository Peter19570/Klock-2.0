// frontend/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  BarChart3,
  Shield,
  Users,
  ChevronRight,
  ArrowRight,
  Activity,
  LayoutDashboard,
  CalendarClock,
} from "lucide-react";
import { KlockLogo } from "@/components/brand/klock-logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { SessionTrendChart } from "@/features/dashboard/components/session-trend-chart";
import { ClockOutPieChart } from "@/features/dashboard/components/clock-out-pie-chart";
import { SessionTable } from "@/features/sessions/components/session-table";
import { LocationMap } from "@/features/attendance/components/location-map";
import { mockDashboardData } from "@/lib/mocks/dashboard-data";
import { mockLocation } from "@/lib/mocks/attendance-data";

const features = [
  {
    icon: MapPin,
    title: "Geofenced Clock-In",
    description:
      "Clock in only from authorized locations. No fake check-ins, no buddy punching.",
  },
  {
    icon: Clock,
    title: "Real-Time Sessions",
    description:
      "See who's on the floor, who's on break, and who forgot to clock out — live.",
  },
  {
    icon: BarChart3,
    title: "Zero-Spreadsheet Reports",
    description:
      "Export trends, spot patterns, and settle payroll disputes with actual data.",
  },
  {
    icon: Shield,
    title: "Built-In Access Control",
    description:
      "Admins run branches. Super admins run the org. Everyone stays in their lane.",
  },
  {
    icon: Users,
    title: "Multi-Branch, One Org",
    description:
      "Add branches as you grow. Same dashboard, same rules, zero chaos.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function getLandingRoute(role: string): string {
  if (role === "USER") return "/attendance";
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/dashboard";
  return "/login";
}

// ============================================
// DESKTOP MOCKUPS
// ============================================

/** Desktop Admin Dashboard */
function DesktopAdminMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="ml-4 flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          klock.app/dashboard
        </div>
      </div>

      <div className="p-4 lg:p-6">
        <h2 className="mb-1 text-base font-semibold text-white lg:text-lg">
          Welcome back, Kwame
        </h2>
        <p className="mb-4 text-xs text-muted-foreground lg:text-sm">
          Here&apos;s what&apos;s happening at your branch today.
        </p>

        <div className="mb-4">
          <DashboardStats role="ADMIN" data={mockDashboardData} />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <SessionTrendChart data={mockDashboardData.sessionTrend ?? []} />
          <ClockOutPieChart stats={mockDashboardData.clockOutStats} />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recent sessions
          </p>
          <SessionTable
            sessions={mockDashboardData.recentSessions?.slice(0, 3) ?? []}
            showUserColumn
          />
        </div>
      </div>
    </div>
  );
}

/** Desktop User Attendance — uses REAL components */
function DesktopUserMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="ml-4 flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          klock.app/attendance
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Real GreetingHero */}
        <div className="py-4 text-left">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Good morning, Kwame.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Real ClockCard + LocationMap grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr]">
          {/* We can't use real ClockCard (needs auth hooks), so we mock the UI to match */}
          <div className="flex h-64 flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Clocked in
              </div>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Current session</p>
                <p className="mt-1 text-4xl font-bold text-white">2:34:18</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Started at 8:02am
                </p>
              </div>
              <button className="w-full max-w-55 rounded-lg bg-primary py-4 text-base font-medium text-primary-foreground">
                Clock out
              </button>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-3.5 w-3.5" />
                Accra Central Branch
              </p>
            </div>
          </div>

          <LocationMap
            location={mockLocation.label}
            coordinates={mockLocation.coordinates}
          />
        </div>

        {/* Recent sessions — no employee column */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-white">Recent Sessions</p>
          <SessionTable
            sessions={mockDashboardData.recentSessions?.slice(0, 3) ?? []}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// MOBILE MOCKUPS — Dynamic Island
// ============================================

/** Mobile Admin Dashboard */
function MobileAdminMockup() {
  return (
    <div className="overflow-hidden rounded-[2.5rem] border-[3px] border-white/10 bg-[#121212] shadow-2xl">
      {/* Dynamic Island */}
      <div className="relative flex justify-center pt-2.5">
        <div className="h-7 w-28 rounded-full bg-black" />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-7 py-1">
        <span className="text-[11px] font-semibold text-white">9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-3 rounded-sm bg-white/20" />
          <div className="h-2.5 w-3 rounded-sm bg-white/20" />
          <div className="h-3 w-5 rounded-sm bg-white/20" />
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground">Welcome back,</p>
        <h2 className="text-lg font-bold text-white">Kwame</h2>

        {/* Mini stat cards */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: "On Floor", value: "12", color: "text-emerald-400" },
            { label: "Active", value: "3", color: "text-primary" },
            { label: "Late", value: "1", color: "text-amber-400" },
            { label: "Forgot", value: "2", color: "text-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/3 p-3">
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mini chart */}
        <div className="mt-3 h-32 rounded-xl bg-white/3 p-3">
          <p className="text-[10px] text-muted-foreground">Session Trend</p>
          <div className="mt-2 flex items-end gap-1 h-20">
            {[45, 62, 38, 78, 55, 70, 48].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Mini table */}
        <div className="mt-3 space-y-2">
          {mockDashboardData.recentSessions?.slice(0, 3).map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-white/3 p-3"
            >
              <div>
                <p className="text-xs text-white">{s.sessionUser}</p>
                <p className="text-[10px] text-muted-foreground">{s.status}</p>
              </div>
              <span
                className={`text-[10px] ${s.status === "ACTIVE" ? "text-primary" : "text-emerald-400"}`}
              >
                {s.status === "ACTIVE" ? "Active" : "Done"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Home indicator */}
      <div className="mx-auto my-2 h-1 w-28 rounded-full bg-white/20" />
    </div>
  );
}

/** Mobile User Attendance — uses REAL components */
function MobileUserMockup() {
  return (
    <div className="overflow-hidden rounded-[2.5rem] border-[3px] border-white/10 bg-[#121212] shadow-2xl">
      {/* Dynamic Island */}
      <div className="relative flex justify-center pt-2.5">
        <div className="h-7 w-28 rounded-full bg-black" />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-7 py-1">
        <span className="text-[11px] font-semibold text-white">9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-3 rounded-sm bg-white/20" />
          <div className="h-2.5 w-3 rounded-sm bg-white/20" />
          <div className="h-3 w-5 rounded-sm bg-white/20" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Real GreetingHero */}
        <div>
          <p className="text-xs text-muted-foreground">Good morning,</p>
          <h2 className="text-xl font-bold text-white">Kwame</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Ready to clock in? You&apos;re at{" "}
            <span className="text-primary">Accra Central</span>
          </p>
        </div>

        {/* Clock card — matches real ClockCard UI */}
        <div className="rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-primary-foreground/70">
                Current session
              </p>
              <p className="mt-0.5 text-2xl font-bold text-white">2:34:18</p>
              <p className="mt-0.5 text-[10px] text-primary-foreground/60">
                Started at 8:02am
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <button className="mt-3 w-full rounded-xl bg-white/10 py-2.5 text-xs font-medium text-white backdrop-blur-sm">
            Clock Out
          </button>
        </div>

        {/* Real LocationMap */}
        <LocationMap
          location={mockLocation.label}
          coordinates={mockLocation.coordinates}
        />

        {/* Recent sessions — no employee column */}
        <div>
          <p className="mb-2 text-xs font-medium text-white">Recent</p>
          <div className="space-y-2">
            {[
              { date: "Yesterday", hours: "8h 12m", status: "Completed" },
              { date: "Jul 17", hours: "7h 45m", status: "Completed" },
              { date: "Jul 16", hours: "8h 30m", status: "Completed" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-white/3 p-2.5"
              >
                <div>
                  <p className="text-[10px] text-white">{s.date}</p>
                  <p className="text-[9px] text-muted-foreground">{s.hours}</p>
                </div>
                <span className="text-[9px] text-emerald-400">{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div className="mx-auto my-2 h-1 w-28 rounded-full bg-white/20" />
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

type DesktopView = "admin" | "user";
type MobileView = "admin" | "user";

export default function LandingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const [scrolled, setScrolled] = useState(false);
  const [desktopView, setDesktopView] = useState<DesktopView>("admin");
  const [mobileView, setMobileView] = useState<MobileView>("admin");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && user?.userRole) {
      router.replace(getLandingRoute(user.userRole));
    }
  }, [status, user, router]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0a] text-foreground dark">
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add('dark')`,
        }}
      />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-chart-3/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <header
        className={`fixed top-0 z-50 w-full border-b border-white/5 transition-all duration-300 ${
          scrolled ? "bg-[#0a0a0a]/80 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <KlockLogo />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Sign in
            </Link>
            <Button size="sm" onClick={() => router.push("/register")}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center px-4 pt-32 pb-16 sm:px-6 lg:pt-40 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Now in beta — free for single-branch teams
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
            Know who&apos;s working.{" "}
            <span className="text-primary">Actually.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Geofenced attendance, real-time session tracking, and payroll-ready
            reports — built for teams that need to stop guessing.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push("/register")}
            >
              Start tracking free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/10 bg-white/5 text-foreground hover:bg-white/10 hover:text-white"
              onClick={() => router.push("/login")}
            >
              Sign in to workspace
            </Button>
          </div>
        </motion.div>

        {/* DESKTOP MOCKUP SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative mx-auto mt-16 hidden w-full max-w-5xl px-4 md:block"
        >
          <div className="absolute -inset-8 rounded-3xl bg-primary/10 blur-3xl" />

          {/* Desktop Toggle */}
          <div className="relative mb-6 flex justify-center gap-2">
            <button
              onClick={() => setDesktopView("admin")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                desktopView === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin Dashboard
            </button>
            <button
              onClick={() => setDesktopView("user")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                desktopView === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              User Attendance
            </button>
          </div>

          {/* Desktop View */}
          <AnimatePresence mode="wait">
            {desktopView === "admin" ? (
              <motion.div
                key="desktop-admin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <DesktopAdminMockup />
              </motion.div>
            ) : (
              <motion.div
                key="desktop-user"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <DesktopUserMockup />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* MOBILE MOCKUP SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative mx-auto mt-16 block w-full max-w-85 px-4 md:hidden"
        >
          <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-3xl" />

          {/* Mobile Toggle */}
          <div className="relative mb-4 flex justify-center gap-2">
            <button
              onClick={() => setMobileView("admin")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium transition-all ${
                mobileView === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="h-3 w-3" />
              Admin
            </button>
            <button
              onClick={() => setMobileView("user")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium transition-all ${
                mobileView === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <CalendarClock className="h-3 w-3" />
              User
            </button>
          </div>

          {/* Mobile View */}
          <AnimatePresence mode="wait">
            {mobileView === "admin" ? (
              <motion.div
                key="mobile-admin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <MobileAdminMockup />
              </motion.div>
            ) : (
              <motion.div
                key="mobile-user"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <MobileUserMockup />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-white/5 bg-white/2 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">
          <p className="text-sm text-muted-foreground">
            Built for teams that actually show up
          </p>
          <div className="flex items-center gap-6 text-muted-foreground/60">
            <span className="text-sm">No credit card</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-sm">Free for 1 branch</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-sm">Self-hosted</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              No enterprise sales calls. No 47-tab spreadsheets. Just attendance
              that works.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group rounded-2xl border border-white/5 bg-white/2 p-6 transition hover:border-primary/20 hover:bg-white/4"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 sm:px-6">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />

          <h2 className="relative text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Stop wondering who&apos;s at work.
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-primary-foreground/80">
            Set up your first branch in under 5 minutes. Free forever.
          </p>
          <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 bg-background text-foreground hover:bg-background/90"
              onClick={() => router.push("/register")}
            >
              Create your workspace
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => router.push("/login")}
            >
              Already have an account?
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <KlockLogo className="opacity-60" />
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Get started
            </Link>
          </div>
          <p className="text-sm text-muted-foreground/60">
            Built for teams that show up.
          </p>
        </div>
      </footer>
    </div>
  );
}
