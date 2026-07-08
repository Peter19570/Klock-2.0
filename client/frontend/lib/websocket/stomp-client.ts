"use client";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE_URL } from "@/lib/api/config";
import { useAuthStore } from "@/store/auth-store";

type ConnectCallback = () => void;

let client: Client | null = null;
let refCount = 0;
const onConnectCallbacks = new Set<ConnectCallback>();

function buildClient(): Client {
  const c = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/api/v1/ws-klock`),
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    beforeConnect: () => {
      // read fresh every (re)connect attempt — access token rotates via
      // refresh and this client outlives any single token
      const token = useAuthStore.getState().accessToken;
      c.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    },
    onConnect: () => {
      onConnectCallbacks.forEach((cb) => cb());
    },
    onStompError: (frame) => {
      console.error("[ws] broker error:", frame.headers.message);
    },
  });
  return c;
}

export function ensureConnected(): Client {
  if (!client) client = buildClient();
  refCount += 1;
  if (!client.active) client.activate();
  return client;
}

export function releaseConnection() {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && client?.active) {
    client.deactivate();
    client = null;
  }
}

/** Re-runs cb on every successful connect, including reconnects. Returns an unregister fn. */
export function onEveryConnect(cb: ConnectCallback): () => void {
  onConnectCallbacks.add(cb);
  if (client?.connected) cb(); // late subscriber joining an already-live session
  return () => onConnectCallbacks.delete(cb);
}

export function subscribe(
  destination: string,
  callback: (message: IMessage) => void,
): StompSubscription | undefined {
  return client?.connected ? client.subscribe(destination, callback) : undefined;
}

export function publish(destination: string, body: unknown) {
  if (client?.connected) {
    client.publish({ destination, body: JSON.stringify(body) });
  }
}