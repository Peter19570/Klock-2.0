"use client";

import { useEffect, useState } from "react";

interface GeoState {
  status: "loading" | "ready" | "error";
  latitude: number | null;
  longitude: number | null;
  label: string | null;
  errorMessage: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    status: "loading",
    latitude: null,
    longitude: null,
    label: null,
    errorMessage: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((s) => ({ ...s, status: "error", errorMessage: "Geolocation isn't supported on this device." }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`,
            { headers: { Accept: "application/json" } }
          );
          const data = await res.json();
          const address = data.address ?? {};

          const parts = [
            address.road,
            address.neighbourhood || address.suburb || address.city_district,
            address.city || address.town || address.village || address.county,
          ].filter(Boolean);

          const label = parts.length > 0
            ? parts.join(", ")
            : data.display_name?.split(",").slice(0, 2).join(",").trim() || "Unknown location";

          setState({ status: "ready", latitude, longitude, label, errorMessage: null });
        } catch {
          setState({ status: "ready", latitude, longitude, label: "Location found", errorMessage: null });
        }
      },
      (error) => {
        setState({
          status: "error",
          latitude: null,
          longitude: null,
          label: null,
          errorMessage: error.code === error.PERMISSION_DENIED ? "Location access denied." : "Couldn't get your location.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return state;
}

export function formatCoordinates(lat: number, lon: number) {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}