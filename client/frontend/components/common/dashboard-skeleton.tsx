// frontend/components/common/dashboard-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

/** Shared skeleton for the page header */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton height={32} width={280} className="rounded-lg" />
      <Skeleton height={20} width={400} className="rounded-md" />
    </div>
  );
}

/** Admin/Super Admin Dashboard Skeleton */
export function AdminDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-16 pt-8">
      <PageHeaderSkeleton />

      {/* Stats cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton height={120} className="rounded-xl" />
        <Skeleton height={120} className="rounded-xl" />
        <Skeleton height={120} className="rounded-xl" />
        <Skeleton height={120} className="rounded-xl" />
      </div>

      {/* Charts row */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <Skeleton height={320} className="flex-1 rounded-xl" />
        <Skeleton height={320} className="w-full rounded-xl lg:w-80" />
      </div>

      {/* Recent sessions table */}
      <div className="space-y-4">
        <Skeleton height={24} width={160} className="rounded-md" />
        <Skeleton height={400} className="rounded-xl" />
      </div>
    </div>
  );
}

/** User Attendance Page Skeleton */
export function AttendanceSkeleton() {
  return (
    <div className="pb-16 space-y-6">
      {/* Greeting hero */}
      <div className="space-y-3 pt-8">
        <Skeleton height={40} width={300} className="rounded-lg" />
        <Skeleton height={20} width={250} className="rounded-md" />
      </div>

      {/* Clock card + Location map grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.3fr_1fr]">
        <Skeleton height={280} className="rounded-xl" />
        <Skeleton height={280} className="rounded-xl" />
      </div>

      {/* Recent sessions */}
      <div className="space-y-4">
        <Skeleton height={24} width={160} className="rounded-md" />
        <Skeleton height={200} className="rounded-xl" />
      </div>
    </div>
  );
}