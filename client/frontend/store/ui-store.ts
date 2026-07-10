import { create } from "zustand";

interface UIState {
  isPanelSidebarOpen: boolean;
  openPanelSidebar: () => void;
  closePanelSidebar: () => void;
  togglePanelSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isPanelSidebarOpen: false,
  openPanelSidebar: () => set({ isPanelSidebarOpen: true }),
  closePanelSidebar: () => set({ isPanelSidebarOpen: false }),
  togglePanelSidebar: () => set((s) => ({ isPanelSidebarOpen: !s.isPanelSidebarOpen })),
}));