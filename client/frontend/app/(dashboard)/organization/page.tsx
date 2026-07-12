"use client";

import { AdminOrgView } from "@/features/organization/components/admin-org-view";
import { usePageTitle } from "@/hooks/use-page-title";

export default function OrganizationPage() {
  usePageTitle("Organization");
  
  return <AdminOrgView />;
}
