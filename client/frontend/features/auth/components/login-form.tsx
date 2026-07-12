"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { backendFetch } from "@/lib/api/backend-client";
import { syncDeviceIdIfNeeded } from "@/lib/api/api";
import { getLandingRoute } from "@/lib/auth/rbac";
import type { components } from "@/lib/api/generated/schema";

type ApiResponseUserDetailedResponse =
  components["schemas"]["ApiResponseUserDetailedResponse"];

function getLoginErrorMessage(status: number, msg?: string): string {
  const normalized = msg?.toLowerCase() ?? "";

  if (status === 401 || normalized.includes("unauthorized")) {
    return "Incorrect email or password";
  }
  if (
    status === 403 ||
    normalized.includes("locked") ||
    normalized.includes("disabled")
  ) {
    return "Your account is locked or disabled. Contact your administrator.";
  }
  if (status >= 500) {
    return "Something went wrong on our end. Please try again shortly.";
  }
  return msg ?? "Couldn't sign in. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await res.json();

    if (!res.ok) {
      setError(getLoginErrorMessage(res.status, payload.msg));
      setLoading(false);
      return;
    }

    useAuthStore.getState().setAccessToken(payload.accessToken);
    const meRes = await backendFetch("/api/v1/users/me");
    const mePayload: ApiResponseUserDetailedResponse = await meRes.json();
    const resolvedUser = mePayload.data ?? payload.user;

    setAuth(payload.accessToken, resolvedUser);
    void syncDeviceIdIfNeeded(resolvedUser.hasSetDevice);
    setLoading(false);
    router.push(getLandingRoute(resolvedUser.userRole!));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
