"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToasts } from "@/components/common/toast";
import { cn } from "@/lib/utils";
import { Camera, Loader2, Mail, Pencil, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import {
  deleteAvatar,
  fetchCurrentUser,
  initializeAvatarUpload,
  type UserDetailedResponse,
} from "@/features/users/api";
import {
  requestEmailChange,
  resendVerificationEmail,
} from "@/features/auth/api";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-muted border-border text-muted-foreground",
  ADMIN: "bg-primary/10 border-primary/30 text-primary",
  SUPER_ADMIN: "bg-secondary/10 border-secondary/30 text-secondary",
};

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value ?? "—"}</span>
    </div>
  );
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const toasts = useToasts();
  const [user, setUser] = useState<UserDetailedResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchCurrentUser().then((data) => {
      setUser(data ?? null);
      setLoading(false);
    });
    // reset the change-email sub-flow each time the modal opens
    setChangingEmail(false);
    setEmailSent(false);
    setNewEmail("");
    setEmailError(null);
  }, [open]);

  async function handleSendEmailChange() {
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    setEmailError(null);
    const { error } = await requestEmailChange(newEmail.trim());
    setEmailLoading(false);
    if (error) {
      setEmailError(error);
      toasts.error(error);
      return;
    }
    setEmailSent(true);
    toasts.success("Confirmation link sent");
  }

  async function handleResendVerification() {
    setResendLoading(true);
    const { error } = await resendVerificationEmail();
    setResendLoading(false);
    if (error) {
      toasts.error(error);
      return;
    }
    setResendSent(true);
    toasts.success("Verification email sent");
  }

  // Cloudinary's webhook updates the backend asynchronously, so poll a
  // couple of times after upload/delete to pick up the persisted value.
  function pollForUpdatedUser(attempts = 3, delayMs = 1500) {
    let ran = 0;
    const tick = () => {
      setTimeout(async () => {
        ran += 1;
        const fresh = await fetchCurrentUser();
        if (fresh) {
          setUser(fresh);
          useAuthStore.getState().updateUser({ picture: fresh.picture });
        }
        if (ran < attempts) tick();
      }, delayMs);
    };
    tick();
  }

  async function handleAvatarUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toasts.error("Please select an image file");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toasts.error("Image must be under 5MB");
      return;
    }

    setAvatarLoading(true);
    const { data, error } = await initializeAvatarUpload();
    if (error || !data) {
      setAvatarLoading(false);
      toasts.error(error ?? "Couldn't start upload");
      return;
    }

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", data.apiKey);
      form.append("timestamp", String(data.timeStamp));
      form.append("signature", data.signature);
      form.append("public_id", data.customPublicId);
      form.append("folder", data.folder);
      form.append("upload_preset", data.uploadPreset);
      form.append("context", data.context);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
        { method: "POST", body: form },
      );

      if (!cloudRes.ok) throw new Error("Cloudinary upload failed");

      toasts.success("Photo uploaded — updating profile...");
      pollForUpdatedUser();
    } catch {
      toasts.error("Couldn't upload photo, try again");
    } finally {
      setAvatarLoading(false);
    }
  }

  async function handleAvatarDelete() {
    setAvatarLoading(true);
    const { error } = await deleteAvatar();
    setAvatarLoading(false);
    if (error) {
      toasts.error(error);
      return;
    }
    toasts.success("Photo removed");
    setUser((prev) => (prev ? { ...prev, picture: undefined } : prev));
    useAuthStore.getState().updateUser({ picture: undefined });
    pollForUpdatedUser();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {loading || !user ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading profile...
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Avatar className="size-12">
                  {user.picture && <AvatarImage src={user.picture} alt="" />}
                  <AvatarFallback>
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Change profile picture"
                    disabled={avatarLoading}
                    className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {avatarLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Camera className="h-3 w-3" />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Upload photo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleAvatarDelete}
                      disabled={!user.picture}
                      className="gap-1.5 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove photo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
              {user.userRole && (
                <span
                  className={cn(
                    "shrink-0 rounded-lg border px-2 py-0.5 text-xs font-medium",
                    ROLE_STYLES[user.userRole],
                  )}
                >
                  {user.userRole.replace("_", " ")}
                </span>
              )}
            </div>

            <div className="divide-y divide-border/40 rounded-xl border border-border p-3.5 text-sm">
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Email verified</span>
                {user.emailVerified ? (
                  <span className="font-medium text-foreground">Yes</span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={resendLoading || resendSent}
                    onClick={handleResendVerification}
                  >
                    {resendLoading
                      ? "Sending..."
                      : resendSent
                        ? "Sent"
                        : "Verify email"}
                  </Button>
                )}
              </div>
              <Row label="Phone" value={user.phone} />
              <Row label="Branch" value={user.assignedBranch} />
              <Row label="Organization" value={user.joinedOrganization} />
              <Row label="Sign-in method" value={user.provider} />
              <Row
                label="Device registered"
                value={user.hasSetDevice ? "Yes" : "No"}
              />
              <Row label="Joined" value={formatDate(user.createdAt)} />
            </div>

            {!changingEmail ? (
              <Button
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => setChangingEmail(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Change email
              </Button>
            ) : emailSent ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-sm">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-foreground">
                  Check <span className="font-medium">{newEmail}</span> for a
                  confirmation link. Your email won&apos;t change until you
                  click it.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 rounded-xl border border-border p-3.5">
                <Label htmlFor="newEmail">New email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="you@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  autoFocus
                />
                {emailError && (
                  <p className="text-xs text-destructive">{emailError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setChangingEmail(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={emailLoading || !newEmail.trim()}
                    onClick={handleSendEmailChange}
                  >
                    {emailLoading ? "Sending..." : "Send link"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
