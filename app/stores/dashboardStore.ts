import { create } from 'zustand';

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  pendingGroups: number;
  pendingEvents: number;
  totalGroups: number;
  totalEvents: number;
}

export interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  setSummary: (summary: DashboardSummary) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  isLoading: false,
  error: null,

  setSummary: (summary: DashboardSummary) =>
    set({ summary }),

  setIsLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  reset: () =>
    set({
      summary: null,
      isLoading: false,
      error: null,
    }),
}));
