import { create } from "zustand";

export type DashboardTab = "overview" | "traces" | "issues" | "alerts";

interface AppState {
  activeTab: DashboardTab;
  selectedAgentId: string | null;
  selectedTraceId: string | null;
  sidebarOpen: boolean;
  setActiveTab: (tab: DashboardTab) => void;
  setSelectedAgent: (id: string | null) => void;
  setSelectedTrace: (id: string | null) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "overview",
  selectedAgentId: null,
  selectedTraceId: null,
  sidebarOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedAgent: (id) => set({ selectedAgentId: id }),
  setSelectedTrace: (id) => set({ selectedTraceId: id }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
