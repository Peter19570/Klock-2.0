type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Tiny pub/sub so unrelated parts of the app (session history) can react
 * to a successful clock in/out without polling anything.
 */
export function emitAttendanceChanged() {
  listeners.forEach((listener) => listener());
}

export function onAttendanceChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}