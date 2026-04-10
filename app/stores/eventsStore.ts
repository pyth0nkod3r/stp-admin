import { create } from 'zustand';
import type { Event } from '@/lib/type';

export interface EventsState {
  events: Event[];
  approvedEvents: Event[];
  pendingEvents: Event[];
  isLoading: boolean;
  error: string | null;
  setEvents: (events: Event[]) => void;
  setApprovedEvents: (events: Event[]) => void;
  setPendingEvents: (events: Event[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  reset: () => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  approvedEvents: [],
  pendingEvents: [],
  isLoading: false,
  error: null,

  setEvents: (events: Event[]) =>
    set({ events }),

  setApprovedEvents: (events: Event[]) =>
    set({ approvedEvents: events }),

  setPendingEvents: (events: Event[]) =>
    set({ pendingEvents: events }),

  setIsLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  addEvent: (event: Event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  removeEvent: (eventId: string) =>
    set((state) => ({
      events: state.events.filter((e) => e.eventId !== eventId),
    })),

  updateEvent: (eventId: string, updates: Partial<Event>) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.eventId === eventId ? { ...e, ...updates } : e
      ),
    })),

  reset: () =>
    set({
      events: [],
      approvedEvents: [],
      pendingEvents: [],
      isLoading: false,
      error: null,
    }),
}));
