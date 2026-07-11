"use client";

import { useEffect, useRef, useState } from "react";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import {
  ensureConnected,
  onEveryConnect,
  releaseConnection,
  subscribe,
} from "@/lib/websocket/stomp-client";

export interface LiveUserInfoResponse {
  id: string;
  email: string;
  fullName: string;
  latitude: string;
  longitude: string;
  timeStamp: string;
  clockEventStatus: string;
  sessionInfo: {
    sessionState: string;
    arrivalStatus: string;
  };
}

// No update in this long → treat the user as gone and drop their marker.
// Tune once you know the real publish cadence / whether there's an
// explicit "went offline" event instead.
const STALE_AFTER_MS = 30_000;
const STALE_CHECK_INTERVAL_MS = 10_000;

export function useLiveUsersSocket(enabled: boolean) {
  const [users, setUsers] = useState<Map<string, LiveUserInfoResponse>>(
    new Map(),
  );
  const lastSeenRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    ensureConnected();
    const subscriptionRef: { current: StompSubscription | undefined } = {
      current: undefined,
    };

    const unregisterConnectHandler = onEveryConnect(() => {
      subscriptionRef.current = subscribe(
        "/topic/user-info",
        (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body) as LiveUserInfoResponse;
            lastSeenRef.current.set(payload.id, Date.now());
            setUsers((prev) => {
              const next = new Map(prev);
              next.set(payload.id, payload);
              return next;
            });
          } catch {
            // malformed payload — skip rather than crash the map
          }
        },
      );
    });

    const staleInterval = setInterval(() => {
      const now = Date.now();
      setUsers((prev) => {
        let changed = false;
        const next = new Map(prev);
        for (const [id, lastSeen] of lastSeenRef.current) {
          if (now - lastSeen > STALE_AFTER_MS && next.has(id)) {
            next.delete(id);
            lastSeenRef.current.delete(id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, STALE_CHECK_INTERVAL_MS);

    return () => {
      unregisterConnectHandler();
      subscriptionRef.current?.unsubscribe();
      clearInterval(staleInterval);
      releaseConnection();
    };
  }, [enabled]);

  return users;
}