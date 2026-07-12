"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ClipboardList,
  MapPinned,
  Trash2,
  Users2,
} from "lucide-react";

interface DeleteOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
  loading?: boolean;
  onConfirm: () => void;
}

const CONSEQUENCES = [
  { icon: Users2, label: "Every user account in this organization" },
  { icon: MapPinned, label: "All branches and their geofence configs" },
  { icon: ClipboardList, label: "All attendance sessions and clock events" },
  { icon: AlertTriangle, label: "All audit logs — including this deletion" },
];

export function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organizationName,
  loading = false,
  onConfirm,
}: DeleteOrganizationDialogProps) {
  const [ackIrreversible, setAckIrreversible] = useState(false);
  const [ackData, setAckData] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isMatch = confirmText.trim() === organizationName;
  const canDelete = ackIrreversible && ackData && isMatch && !loading;

  function reset() {
    setAckIrreversible(false);
    setAckData(false);
    setConfirmText("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <DialogTitle className="text-destructive">
              Delete organization
            </DialogTitle>
          </div>
          <DialogDescription>
            You&apos;re about to permanently delete{" "}
            <span className="font-medium text-foreground">
              {organizationName}
            </span>
            . This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5">
          <p className="text-xs font-medium tracking-wide text-destructive uppercase">
            This will also delete
          </p>
          <ul className="space-y-2">
            {CONSEQUENCES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-destructive" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={ackIrreversible}
              onChange={(e) => setAckIrreversible(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-destructive"
            />
            <span className="text-muted-foreground">
              I understand this action is{" "}
              <span className="font-medium text-foreground">
                permanent and cannot be reversed
              </span>
              .
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={ackData}
              onChange={(e) => setAckData(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-destructive"
            />
            <span className="text-muted-foreground">
              I understand{" "}
              <span className="font-medium text-foreground">
                all users, branches, sessions, and audit logs
              </span>{" "}
              will be permanently lost.
            </span>
          </label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-org-name">
            Type{" "}
            <span className="font-mono font-medium text-foreground">
              {organizationName}
            </span>{" "}
            to confirm
          </Label>
          <Input
            id="confirm-org-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={organizationName}
            disabled={loading}
            autoComplete="off"
            className={cn(
              confirmText.length > 0 &&
                !isMatch &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
        </div>

        {/* TODO: email confirmation step goes here before the delete call fires */}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!canDelete}
            onClick={onConfirm}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {loading ? "Deleting..." : "Delete organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
