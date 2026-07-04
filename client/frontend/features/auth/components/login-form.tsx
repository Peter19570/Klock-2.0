"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { backendFetch } from "@/lib/api/backend-client";
import { getLandingRoute } from "@/lib/auth/rbac";
import type { components } from "@/lib/api/generated/schema";

type ApiResponseUserDetailedResponse = components["schemas"]["ApiResponseUserDetailedResponse"];

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
      setError(payload.msg ?? "Login failed");
      setLoading(false);
      return;
    }

    useAuthStore.getState().setAccessToken(payload.accessToken);

    // hit /users/me so the store shape always matches what bootstrap() produces
    const meRes = await backendFetch("/api/v1/users/me");
    const mePayload: ApiResponseUserDetailedResponse = await meRes.json();
    const resolvedUser = mePayload.data ?? payload.user;

    setAuth(payload.accessToken, resolvedUser);
    setLoading(false);
    router.push(getLandingRoute(resolvedUser.userRole!));
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
    </form>
  );
}