"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EnumSelect } from "@/components/common/enum-select";
import { BranchSelect } from "@/features/users/components/branch-select";
import { useAuthStore } from "@/store/auth-store";
import { useToasts } from "@/components/common/toast";
import {
  createUser,
  updateUser,
  type UserResponse,
} from "@/features/users/api";

const ROLE_OPTIONS = ["USER", "ADMIN", "SUPER_ADMIN"] as const;

type Role = (typeof ROLE_OPTIONS)[number];

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  user?: UserResponse | null;
  onSuccess: (user: UserResponse) => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  onSuccess,
}: UserFormDialogProps) {
  const toasts = useToasts();
  const role = useAuthStore((s) => s.user?.userRole);
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userRole, setUserRole] = useState<Role | undefined>("USER");
  const [branchId, setBranchId] = useState<string | undefined>();
  const [branchLabel, setBranchLabel] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setPhone("");
      setUserRole(user.userRole);
      setBranchId(undefined);
      setBranchLabel(user.assignedBranch);
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setUserRole("USER");
      setBranchId(undefined);
      setBranchLabel(undefined);
    }
    setError(null);
  }, [open, mode, user]);

  const rolePickedNeedsPhone =
    userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const showRoleAndBranch = mode === "create" || isSuperAdmin;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (showRoleAndBranch && rolePickedNeedsPhone && !phone.trim()) {
      setError("Phone is required for Admin and Super Admin roles.");
      return;
    }

    setLoading(true);

    if (mode === "create") {
      const { data, error: err } = await createUser({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        userRole,
        branchId,
      });
      setLoading(false);
      if (err || !data) {
        setError(err ?? "Something went wrong");
        toasts.error(err ?? "Failed to create user");
        return;
      }
      toasts.success("User created");
      onSuccess(data);
      onOpenChange(false);
      return;
    }

    if (mode === "edit" && user?.id) {
      const body = showRoleAndBranch
        ? { firstName, lastName, phone: phone || undefined, userRole, branchId }
        : { firstName, lastName, phone: phone || undefined };

      const { data, error: err } = await updateUser(user.id, body);
      setLoading(false);
      if (err || !data) {
        setError(err ?? "Something went wrong");
        toasts.error(err ?? "Failed to update user");
        return;
      }
      toasts.success("User updated");
      onSuccess(data);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create user" : "Edit user"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {mode === "create" && (
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Phone{rolePickedNeedsPhone && showRoleAndBranch ? " *" : ""}
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={rolePickedNeedsPhone && showRoleAndBranch}
            />
          </div>

          {showRoleAndBranch && (
            <>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <EnumSelect
                  value={userRole}
                  onChange={setUserRole}
                  options={ROLE_OPTIONS}
                  placeholder="Select role"
                  formatLabel={(v) => v.replace("_", " ")}
                  className="h-10 w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Branch</Label>
                <BranchSelect
                  value={branchId}
                  valueLabel={branchLabel}
                  onChange={(id, branch) => {
                    setBranchId(id);
                    setBranchLabel(branch?.displayName);
                  }}
                />
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Saving..."
              : mode === "create"
                ? "Create user"
                : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
