"use client";

import { useAuthStore } from "@/store/auth-store";
import { SuperAdminBranchesView } from "@/features/branches/components/super-admin-branches-view";
import { AdminBranchView } from "@/features/branches/components/admin-branch-view";

export default function BranchesPage() {
  const role = useAuthStore((s) => s.user?.userRole);

  if (role === "ADMIN") {
    return <AdminBranchView />;
  }

  return <SuperAdminBranchesView />;
}