// frontend/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  MapPin,
  Clock,
  BarChart3,
  Shield,
  Users,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { KlockLogo } from "@/components/brand/klock-logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

const features = [
  {
    icon: MapPin,
    title: "Geofenced Clock-In",
    description:
      "Employees clock in only from authorized locations. No more buddy punching or fake check-ins.",
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description:
      "See who's clocked in, who's late, and who's on break — live, as it happens.",
  },
  {
    icon: BarChart3,
    title: "Smart Reports",
    description:
      "Export attendance data, track trends, and spot patterns without digging through spreadsheets.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Admins manage branches, super admins manage organizations. Everyone sees exactly what they need.",
  },
  {
    icon: Users,
    title: "Multi-Branch Ready",
    description:
      "One organization, multiple branches, unlimited employees. Scale without the chaos.",
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

export default function LandingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <header
        className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-background/80 backdrop-blur-md"
            : "border-transparent bg-transparent"
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
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 pt-32 pb-20 sm:px-6">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Now in beta
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Attendance that actually{" "}
            <span className="text-primary">makes sense</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Geofenced clock-ins, real-time session tracking, and clean reports —
            built for teams that need to know who&apos;s where, when.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => router.push("/register")}
            >
              Start tracking free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/login")}
            >
              Sign in to your workspace
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Built for small teams and growing organizations. No bloat, no
              enterprise sales calls.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/20 hover:shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
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
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to stop guessing who&apos;s at work?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-primary-foreground/80">
            Set up your organization in minutes. First branch is free forever.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
      <footer className="border-t border-border px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <KlockLogo className="opacity-60" />
          <p className="text-sm text-muted-foreground">
            Built for teams that show up. No fake stats, no BS.
          </p>
        </div>
      </footer>
    </div>
  );
}
