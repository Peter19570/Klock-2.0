"use client";

import dynamic from "next/dynamic";

const LiveMap = dynamic(
  () =>
    import("@/features/live-map/components/live-map").then((m) => m.LiveMap),
  { ssr: false },
);

export default function LiveMapPage() {
  return <LiveMap />;
}
