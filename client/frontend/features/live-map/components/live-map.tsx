"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { User } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "@/lib/theme/theme-provider";
import { getMyBranch, getAllBranches } from "@/features/live-map/api";
import { useLiveUsersSocket } from "@/features/live-map/hooks/use-live-users-socket";
import { BranchSelector } from "./branch-selector";
import type { components } from "@/lib/api/generated/schema";
import { UserInfoTooltip } from "./user-info-tooltip";
import { Building2 } from "lucide-react";

type BranchResponse = components["schemas"]["BranchResponse"];
type BranchDetailedResponse = components["schemas"]["BranchDetailedResponse"];

const DEFAULT_CENTER: [number, number] = [5.6037, -0.187]; // Accra fallback

const CARTO_TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

function branchIcon() {
  const svg = renderToStaticMarkup(
    <Building2 size={16} strokeWidth={2.5} color="var(--primary-foreground)" />,
  );
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 30px; height: 30px;
      background: var(--primary);
      border: 2px solid var(--card);
      border-radius: 8px 8px 8px 2px;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="transform: rotate(45deg);">${svg}</div>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [15, 30], // bottom-center point, like a map pin
  });
}

// Placeholder styling — using --secondary just to visually separate people
// from branches for now. Swap the color scheme once you get to that pass.
function userIcon() {
  const svg = renderToStaticMarkup(
    <User size={14} strokeWidth={2.5} color="var(--secondary-foreground)" />,
  );
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 24px; height: 24px; border-radius: 9999px;
      background: var(--secondary);
      border: 2px solid var(--card);
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
    ">${svg}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function timeAgo(isoTimestamp: string): string {
  const ms = Date.now() - new Date(isoTimestamp).getTime();
  // If your backend actually sends epoch millis as a string instead of ISO,
  // swap the line above for: const ms = Date.now() - Number(isoTimestamp);
  if (Number.isNaN(ms)) return "unknown";
  const seconds = Math.round(ms / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
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

  // Live, on this route only — the hook disconnects on unmount via
  // releaseConnection(), so leaving /live-map tears this down cleanly.
  const liveUsers = useLiveUsersSocket(true);

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

        {Array.from(liveUsers.values()).map((u) => {
          const lat = parseFloat(u.latitude);
          const lon = parseFloat(u.longitude);
          if (Number.isNaN(lat) || Number.isNaN(lon)) return null; // bad data shouldn't crash the map

          return (
            <Marker key={u.id} position={[lat, lon]} icon={userIcon()}>
              <Tooltip
                direction="top"
                offset={[0, -14]}
                opacity={1}
                className="rounded-xl! border-0! bg-card! p-0! shadow-lg!"
              >
                <UserInfoTooltip user={u} />
              </Tooltip>
            </Marker>
          );
        })}

        <FlyToBranch target={flyTarget} />
      </MapContainer>
    </div>
  );
}
