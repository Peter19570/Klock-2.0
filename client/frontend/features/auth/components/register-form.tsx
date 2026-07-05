"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { backendFetch } from "@/lib/api/backend-client";
import { getLandingRoute } from "@/lib/auth/rbac";
import type { components } from "@/lib/api/generated/schema";

type ApiResponseUserDetailedResponse =
  components["schemas"]["ApiResponseUserDetailedResponse"];

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    displayName: "",
    description: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.displayName,
        description: form.description || undefined,
        registerRequest: {
          email: form.email,
          password: form.password,
          userCreateRequest: {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone || undefined,
          },
        },
      }),
    });
    const payload = await res.json();

    if (!res.ok) {
      setError(payload.msg ?? "Registration failed");
      setLoading(false);
      return;
    }

    useAuthStore.getState().setAccessToken(payload.accessToken);
    const meRes = await backendFetch("/api/v1/users/me");
    const mePayload: ApiResponseUserDetailedResponse = await meRes.json();
    const resolvedUser = mePayload.data ?? payload.user;

    setAuth(payload.accessToken, resolvedUser);
    setLoading(false);
    router.push(getLandingRoute(resolvedUser.userRole!));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Organization
        </legend>
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Organization name</Label>
          <Input
            id="displayName"
            placeholder="Acme Corp"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of your organization"
            rows={2}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Your account
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
