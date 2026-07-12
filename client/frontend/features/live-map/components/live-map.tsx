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
import { ArrowUp } from "lucide-react";
import { BranchInfoCard } from "./branch-info-card";

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

function FlyToBranch({ lat, lon }: { lat: number | null; lon: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lon != null) {
      map.flyTo([lat, lon], 16, { duration: 1.2 });
    }
    // primitives, not an array literal — this is what stops it re-firing
    // every time an unrelated re-render (e.g. a websocket tick) creates a
    // structurally-identical-but-referentially-new target array.
  }, [lat, lon, map]);
  return null;
}

function BranchReturnIndicator({
  lat,
  lon,
}: {
  lat: number | null;
  lon: number | null;
}) {
  const map = useMap();
  const [state, setState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    angleDeg: number;
  }>({ visible: false, x: 0, y: 0, angleDeg: 0 });

  useEffect(() => {
    if (lat == null || lon == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((s) => (s.visible ? { ...s, visible: false } : s));
      return;
    }

    const target = L.latLng(lat, lon);
    const PADDING = 48;

    function recompute() {
      const bounds = map.getBounds();
      if (bounds.contains(target)) {
        setState((s) => (s.visible ? { ...s, visible: false } : s));
        return;
      }
      const size = map.getSize();
      const point = map.latLngToContainerPoint(target);
      const centerX = size.x / 2;
      const centerY = size.y / 2;
      const clampedX = Math.min(Math.max(point.x, PADDING), size.x - PADDING);
      const clampedY = Math.min(Math.max(point.y, PADDING), size.y - PADDING);
      const angleDeg =
        (Math.atan2(point.y - centerY, point.x - centerX) * 180) / Math.PI + 90;
      setState({ visible: true, x: clampedX, y: clampedY, angleDeg });
    }

    recompute();
    map.on("move", recompute);
    map.on("zoom", recompute);
    map.on("resize", recompute);

    return () => {
      map.off("move", recompute);
      map.off("zoom", recompute);
      map.off("resize", recompute);
    };
  }, [lat, lon, map]);

  if (!state.visible || lat == null || lon == null) return null;

  return (
    <button
      type="button"
      onClick={() => map.flyTo([lat, lon], 16, { duration: 1.2 })}
      style={{
        left: state.x,
        top: state.y,
        transform: "translate(-50%, -50%)",
      }}
      className="absolute z-1000 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-lg transition-transform hover:scale-105"
    >
      <ArrowUp
        className="h-3.5 w-3.5 text-primary"
        style={{ transform: `rotate(${state.angleDeg}deg)` }}
      />
      Back to branch
    </button>
  );
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
                    <Popup
                      closeButton={false}
                      className="[&_.leaflet-popup-content-wrapper]:rounded-xl! [&_.leaflet-popup-content-wrapper]:border! [&_.leaflet-popup-content-wrapper]:border-border! [&_.leaflet-popup-content-wrapper]:bg-card! [&_.leaflet-popup-content-wrapper]:p-0! [&_.leaflet-popup-content-wrapper]:shadow-lg! [&_.leaflet-popup-content]:m-0! [&_.leaflet-popup-content]:w-auto! [&_.leaflet-popup-tip]:bg-card! [&_.leaflet-popup-tip]:shadow-none!"
                    >
                      <BranchInfoCard
                        displayName={b.displayName}
                        branchStatus={b.branchStatus}
                        radius={b.radius}
                      />
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
                  <Popup
                    closeButton={false}
                    className="[&_.leaflet-popup-content-wrapper]:rounded-xl! [&_.leaflet-popup-content-wrapper]:border! [&_.leaflet-popup-content-wrapper]:border-border! [&_.leaflet-popup-content-wrapper]:bg-card! [&_.leaflet-popup-content-wrapper]:p-0! [&_.leaflet-popup-content-wrapper]:shadow-lg! [&_.leaflet-popup-content]:m-0! [&_.leaflet-popup-content]:w-auto! [&_.leaflet-popup-tip]:bg-card! [&_.leaflet-popup-tip]:shadow-none!"
                  >
                    <BranchInfoCard
                      displayName={myBranch.displayName}
                      branchStatus={myBranch.branchStatus}
                      radius={myBranch.radius}
                      shiftStart={myBranch.shiftStart}
                      shiftEnd={myBranch.shiftEnd}
                    />
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

        <FlyToBranch
          lat={selectedBranch?.latitude ?? null}
          lon={selectedBranch?.longitude ?? null}
        />
        <BranchReturnIndicator
          lat={selectedBranch?.latitude ?? null}
          lon={selectedBranch?.longitude ?? null}
        />
      </MapContainer>
    </div>
  );
}
