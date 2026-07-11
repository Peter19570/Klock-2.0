"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "@/lib/theme/theme-provider";
import { getMyBranch, getAllBranches } from "@/features/live-map/api";
import { BranchSelector } from "./branch-selector";
import type { components } from "@/lib/api/generated/schema";

type BranchResponse = components["schemas"]["BranchResponse"];
type BranchDetailedResponse = components["schemas"]["BranchDetailedResponse"];

const DEFAULT_CENTER: [number, number] = [5.6037, -0.187]; // Accra fallback

const CARTO_TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

function branchIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 16px; height: 16px; border-radius: 9999px;
      background: var(--primary);
      border: 2px solid var(--card);
      box-shadow: 0 0 0 2px var(--primary);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function FlyToBranch({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 16, { duration: 1.2 });
  }, [target, map]);
  return null;
}

export function LiveMap() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.userRole === "SUPER_ADMIN";
  const { resolvedTheme } = useTheme();

  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [myBranch, setMyBranch] = useState<BranchDetailedResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isSuperAdmin) {
        const data = await getAllBranches();
        if (!cancelled) setBranches(data);
      } else {
        const data = await getMyBranch();
        if (!cancelled) setMyBranch(data);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedId) ?? null,
    [branches, selectedId],
  );

  const flyTarget: [number, number] | null =
    selectedBranch?.latitude != null && selectedBranch?.longitude != null
      ? [selectedBranch.latitude, selectedBranch.longitude]
      : null;

  const center: [number, number] = isSuperAdmin
    ? branches[0]?.latitude != null && branches[0]?.longitude != null
      ? [branches[0].latitude, branches[0].longitude]
      : DEFAULT_CENTER
    : myBranch?.latitude != null && myBranch?.longitude != null
      ? [myBranch.latitude, myBranch.longitude]
      : DEFAULT_CENTER;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    // `isolate` forces this wrapper to own its own stacking context, so
    // Leaflet's internal panes (which use z-index up to 700 for popups)
    // can never escape and paint over the sidebar / dropdowns / navbar.
    <div className="relative isolate h-[calc(100vh-4rem)] w-full">
      {isSuperAdmin && (
        <div className="absolute left-20 top-4 z-1000 w-64">
          <BranchSelector
            branches={branches}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      )}

      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full overflow-hidden rounded-2xl"
      >
        <TileLayer
          url={resolvedTheme === "dark" ? CARTO_TILES.dark : CARTO_TILES.light}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {isSuperAdmin
          ? branches.map((b) =>
              b.latitude != null && b.longitude != null ? (
                <Fragment key={b.id}>
                  <Marker
                    position={[b.latitude, b.longitude]}
                    icon={branchIcon()}
                  >
                    <Popup>
                      <div className="text-sm font-medium">{b.displayName}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.currentActiveCount ?? 0} active now
                      </div>
                    </Popup>
                  </Marker>
                  {b.radius != null && (
                    <Circle
                      center={[b.latitude, b.longitude]}
                      radius={b.radius}
                      pathOptions={{
                        color: "var(--primary)",
                        fillColor: "var(--primary)",
                        fillOpacity: 0.12,
                        weight: 1.5,
                      }}
                    />
                  )}
                </Fragment>
              ) : null,
            )
          : myBranch?.latitude != null &&
            myBranch?.longitude != null && (
              <>
                <Marker
                  position={[myBranch.latitude, myBranch.longitude]}
                  icon={branchIcon()}
                >
                  <Popup>
                    <div className="text-sm font-medium">
                      {myBranch.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {myBranch.currentActiveCount ?? 0} active now
                    </div>
                  </Popup>
                </Marker>
                {myBranch.radius != null && (
                  <Circle
                    center={[myBranch.latitude, myBranch.longitude]}
                    radius={myBranch.radius}
                    pathOptions={{
                      color: "var(--primary)",
                      fillColor: "var(--primary)",
                      fillOpacity: 0.12,
                      weight: 1.5,
                    }}
                  />
                )}
              </>
            )}

        <FlyToBranch target={flyTarget} />
      </MapContainer>
    </div>
  );
}
