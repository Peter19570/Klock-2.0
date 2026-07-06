"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useToasts } from "@/components/common/toast";
import { ApiError } from "@/lib/api/api-error";
import { changePassword } from "../api";

export function ForcePasswordChangeDialog() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const toasts = useToasts();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const open = user?.mustChangePassword === true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toasts.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toasts.error("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ newPassword });
      toasts.success("Password updated.");
      if (user && accessToken) {
        setAuth(accessToken, { ...user, mustChangePassword: false });
      }
    } catch (err) {
      toasts.error(
        err instanceof ApiError
          ? err.detail
          : "Couldn't update password. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Set a new password</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Your account needs a new password before you continue.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Saving..." : "Save password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
