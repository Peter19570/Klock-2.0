"use client";

import { Pencil, Smartphone, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserResponse } from "@/features/users/api";

interface UserTableProps {
  users: UserResponse[];
  canDelete: boolean;
  onRowClick: (id: string) => void;
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  onResetDevice: (user: UserResponse) => void;
  className?: string;
}

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-muted border-border text-muted-foreground",
  ADMIN: "bg-primary/10 border-primary/30 text-primary",
  SUPER_ADMIN: "bg-secondary/10 border-secondary/30 text-secondary",
};

const gridCols = "1.4fr 1.6fr 1fr 1fr 120px";

export function UserTable({
  users,
  canDelete,
  onRowClick,
  onEdit,
  onDelete,
  onResetDevice,
  className,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        No users found.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <div className="min-w-190">
          <div
            className="grid items-center gap-3 border-b border-border/60 bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Branch</div>
            <div className="text-right pr-2">Actions</div>
          </div>

          {users.map((user, i) => (
            <div
              key={user.id}
              onClick={() => user.id && onRowClick(user.id)}
              className={cn(
                "grid cursor-pointer items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/30",
                i < users.length - 1 && "border-b border-border/40",
              )}
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="truncate font-medium text-foreground">
                {user.firstName} {user.lastName}
              </div>
              <div className="truncate text-muted-foreground">
                {user.email ?? "—"}
              </div>
              <div>
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
              <div className="truncate text-muted-foreground">
                {user.assignedBranch ?? "—"}
              </div>
              <div
                className="flex items-center justify-end gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  title="Edit user"
                  onClick={() => onEdit(user)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Reset device ID"
                  onClick={() => onResetDevice(user)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
                {canDelete && (
                  <button
                    type="button"
                    title="Delete user"
                    onClick={() => onDelete(user)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
