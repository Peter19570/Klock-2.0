"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchUserById, type UserDetailedResponse } from "@/features/users/api";
import { cn } from "@/lib/utils";

interface UserDetailModalProps {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-muted border-border text-muted-foreground",
  ADMIN: "bg-primary/10 border-primary/30 text-primary",
  SUPER_ADMIN: "bg-secondary/10 border-secondary/30 text-secondary",
};

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2 last:border-none">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">
        {value ?? "—"}
      </span>
    </div>
  );
}

export function UserDetailModal({
  userId,
  onOpenChange,
}: UserDetailModalProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetailedResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null);
      return;
    }
    setLoading(true);
    fetchUserById(userId).then((data) => {
      setUser(data ?? null);
      setLoading(false);
    });
  }, [userId]);

  return (
    <Dialog open={!!userId} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
        </DialogHeader>

        {loading || !user ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {user.userRole && (
                <span
                  className={cn(
                    "rounded-lg border px-2 py-1 text-xs font-medium",
                    ROLE_STYLES[user.userRole],
                  )}
                >
                  {user.userRole.replace("_", " ")}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 px-4">
              <Row label="Phone" value={user.phone} />
              <Row label="Branch" value={user.assignedBranch} />
              <Row label="Organization" value={user.joinedOrganization} />
              <Row
                label="Email verified"
                value={user.emailVerified ? "Yes" : "No"}
              />
              <Row
                label="Device registered"
                value={user.hasSetDevice ? "Yes" : "No"}
              />
              <Row
                label="Joined"
                value={
                  user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : undefined
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/sessions?userId=${user.id}`)}
              >
                View sessions
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/audits?userId=${user.id}`)}
              >
                View audits
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
