"use client";

import { LiveMap } from "@/features/live-map/components/live-map";

export default function LiveMapPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col py-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight">Live Map</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time location of active staff across your branches.
        </p>
      </div>
      <div className="mt-4 min-h-0 flex-1">
        <LiveMap />
      </div>
    </div>
  );
}
