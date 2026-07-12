"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/config";

type Status = "confirming" | "success" | "error";

export function ConfirmEmailStatus() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<Status>("confirming");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      return;
    }
    fetch(
      `${API_BASE_URL}/api/v1/auth/confirm-email?token=${encodeURIComponent(token)}`,
    )
      .then((res) => setStatus(res.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "confirming") {
    return (
      <p className="text-sm text-muted-foreground">
        Confirming your new email...
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">
          This confirmation link is invalid or has expired.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground">Your email has been updated.</p>
      <Link href="/login" className="text-sm text-primary hover:underline">
        Continue to sign in
      </Link>
    </div>
  );
}
