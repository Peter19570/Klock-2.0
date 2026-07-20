"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api/api-config";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    // same success state regardless of outcome — don't reveal if the email exists
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        If an account exists for{" "}
        <span className="text-foreground">{email}</span>, a reset link is on its
        way.
      </p>
    );
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
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
