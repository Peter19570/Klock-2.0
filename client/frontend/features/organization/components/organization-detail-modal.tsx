"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Calendar, Pencil, Trash2, X } from "lucide-react";
import type { OrganizationDetailedResponse } from "@/features/organization/api";

interface OrganizationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: OrganizationDetailedResponse | null;
  loading?: boolean;
  saving?: boolean;
  onSave: (body: {
    displayName: string;
    description?: string;
  }) => Promise<boolean>;
  onDeleteClick: () => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OrganizationDetailModal({
  open,
  onOpenChange,
  organization,
  loading,
  saving,
  onSave,
  onDeleteClick,
}: OrganizationDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (organization) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(organization.displayName ?? "");
      setDescription(organization.description ?? "");
    }
  }, [organization]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setIsEditing(false);
  }, [open]);

  async function handleSave() {
    const ok = await onSave({
      displayName: displayName.trim(),
      description: description.trim() || undefined,
    });
    if (ok) setIsEditing(false);
  }

  function handleCancelEdit() {
    setDisplayName(organization?.displayName ?? "");
    setDescription(organization?.description ?? "");
    setIsEditing(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {loading || !organization ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading organization...
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 pr-6">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <DialogTitle className="truncate">
                  {isEditing ? "Edit organization" : organization.displayName}
                </DialogTitle>
              </div>
            </DialogHeader>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="org-display-name">Display name</Label>
                  <Input
                    id="org-display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="org-description">Description</Label>
                  <Textarea
                    id="org-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={saving}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 rounded-xl border border-border p-3.5 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">
                    Description
                  </span>
                  <span className="text-right font-medium text-foreground">
                    {organization.description || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(organization.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Organization ID</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {organization.id}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={saving || !displayName.trim()}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit organization
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={onDeleteClick}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete organization
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
