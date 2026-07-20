"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/api-config";

type Status = "verifying" | "success" | "error";

export function VerifyEmailStatus() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<Status>("verifying");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      return;
    }
    fetch(
      `${API_BASE_URL}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`,
    )
      .then((res) => setStatus(res.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "verifying") {
    return (
      <p className="text-sm text-muted-foreground">Verifying your email...</p>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">
          This verification link is invalid or has expired.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground">Your email is verified.</p>
      <Link href="/login" className="text-sm text-primary hover:underline">
        Continue to sign in
      </Link>
    </div>
  );
}
