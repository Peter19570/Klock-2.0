"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchSessions } from "@/lib/api/sessions";
import { SessionTable } from "./session-table";
import { useAuthStore } from "@/store/auth-store";
import { onAttendanceChanged } from "@/lib/attendance-events";
import type { components } from "@/lib/api/generated/schema";

type SessionResponse = components["schemas"]["SessionResponse"];

export function RecentSessions() {
  const role = useAuthStore((s) => s.user?.userRole);
  const [sessions, setSessions] = useState<SessionResponse[] | null>(null);

  const loadSessions = useCallback(() => {
    fetchSessions({ page: 0 }).then((data) => {
      // backend page size is locked to 50 — this widget only ever shows the first 10 of that
      setSessions((data?.content ?? []).slice(0, 10));
    });
  }, []);

  useEffect(() => {
    loadSessions();
    return onAttendanceChanged(loadSessions);
  }, [loadSessions]);

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Session history
        </h2>
        <Link
          href="/sessions"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {sessions === null ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading sessions...
        </div>
      ) : (
        <SessionTable
          sessions={sessions}
          showUserColumn={role === "ADMIN" || role === "SUPER_ADMIN"}
        />
      )}
    </section>
  );
}
