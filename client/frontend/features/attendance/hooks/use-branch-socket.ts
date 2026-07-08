"use client";

import { useEffect, useRef } from "react";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import {
  ensureConnected,
  onEveryConnect,
  publish,
  releaseConnection,
  subscribe,
} from "@/lib/websocket/stomp-client";
import type { components } from "@/lib/api/generated/schema";

type BranchUserResponse = components["schemas"]["BranchUserResponse"];

// ⚠️ placeholder — confirm the real @MessageMapping destination, see note below
const LOCATION_PUBLISH_DESTINATION = "/app/location";
const LOCATION_PUBLISH_INTERVAL_MS = 3500;

export function useBranchSocket(
  branchId: string | null | undefined,
  enabled: boolean,
  onBranchUpdate: (payload: BranchUserResponse) => void,
) {
  const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!enabled || !branchId) return;

    ensureConnected();
    const subscriptionRef: { current: StompSubscription | undefined } = { current: undefined };

    const unregisterConnectHandler = onEveryConnect(() => {
      subscriptionRef.current = subscribe(
        `/topic/branches/${branchId}/updates`,
  (message: IMessage) => {
    try {
      const payload = JSON.parse(message.body) as BranchUserResponse;
      onBranchUpdate(payload);
    } catch {
            // malformed payload — skip rather than crash the session
          }
        },
      );
    });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        lastPositionRef.current = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
      },
      () => {
        // silent — publish just skips a beat if this fails
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    const publishInterval = setInterval(() => {
      const pos = lastPositionRef.current;
      if (pos) {
        publish(LOCATION_PUBLISH_DESTINATION, { latitude: pos.lat, longitude: pos.lon });
      }
    }, LOCATION_PUBLISH_INTERVAL_MS);

    return () => {
      unregisterConnectHandler();
      subscriptionRef.current?.unsubscribe();
      navigator.geolocation.clearWatch(watchId);
      clearInterval(publishInterval);
      releaseConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, branchId]);
}