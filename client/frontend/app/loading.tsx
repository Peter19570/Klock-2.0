// frontend/app/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar skeleton */}
      <div className="flex h-16 items-center gap-4 border-b px-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Sidebar skeleton */}
        <div className="hidden w-60 flex-col gap-4 md:flex">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <div className="mt-auto">
            <Skeleton className="h-8 w-full" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
