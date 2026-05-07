import { create } from 'zustand';
import type { UIState, Notification } from './types';

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: false,
  isSidebarOpen: true,
  isLoading: false,
  notifications: [],
  activeModal: null,

  toggleDarkMode: () =>
    set((state) => ({ isDarkMode: !state.isDarkMode })),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open: boolean) =>
    set({ isSidebarOpen: open }),

  setIsLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  addNotification: (notification: Notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  setActiveModal: (modalId: string | null) =>
    set({ activeModal: modalId }),
}));

// Helper function to show notifications easily
export const showNotification = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  duration: number = 3000
) => {
  const id = Math.random().toString(36).substr(2, 9);
  const store = useUIStore.getState();

  store.addNotification({ id, message, type, duration });

  if (duration > 0) {
    setTimeout(() => {
      store.removeNotification(id);
    }, duration);
  }

  return id;
};
