import { create } from 'zustand';
import type { Opportunity } from './types';

export interface OpportunitiesState {
  opportunities: Opportunity[];
  currentOpportunity: Opportunity | null;
  isLoading: boolean;
  error: string | null;
  setOpportunities: (opportunities: Opportunity[]) => void;
  setCurrentOpportunity: (opportunity: Opportunity | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addOpportunity: (opportunity: Opportunity) => void;
  removeOpportunity: (id: string) => void;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  reset: () => void;
}

export const useOpportunitiesStore = create<OpportunitiesState>(
  (set, get) => ({
    opportunities: [],
    currentOpportunity: null,
    isLoading: false,
    error: null,

    setOpportunities: (opportunities: Opportunity[]) =>
      set({ opportunities }),

    setCurrentOpportunity: (opportunity: Opportunity | null) =>
      set({ currentOpportunity: opportunity }),

    setIsLoading: (loading: boolean) =>
      set({ isLoading: loading }),

    setError: (error: string | null) =>
      set({ error }),

    addOpportunity: (opportunity: Opportunity) =>
      set((state) => ({
        opportunities: [opportunity, ...state.opportunities],
      })),

    removeOpportunity: (id: string) =>
      set((state) => ({
        opportunities: state.opportunities.filter((o) => o.id !== id),
        currentOpportunity:
          state.currentOpportunity?.id === id
            ? null
            : state.currentOpportunity,
      })),

    updateOpportunity: (id: string, updates: Partial<Opportunity>) =>
      set((state) => ({
        opportunities: state.opportunities.map((o) =>
          o.id === id ? { ...o, ...updates } : o
        ),
        currentOpportunity:
          state.currentOpportunity?.id === id
            ? { ...state.currentOpportunity, ...updates }
            : state.currentOpportunity,
      })),

    reset: () =>
      set({
        opportunities: [],
        currentOpportunity: null,
        isLoading: false,
        error: null,
      }),
  })
);
