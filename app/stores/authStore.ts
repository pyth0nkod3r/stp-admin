import { create } from 'zustand';
import type { AuthState, User } from './types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user: User) =>
    set({ user, isAuthenticated: !!user }),

  setToken: (token: string) =>
    set({ token }),

  setIsAuthenticated: (authenticated: boolean) =>
    set({ isAuthenticated: authenticated }),

  setIsLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    }),
}));

// Optional: Add devtools support for debugging
// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';
// export const useAuthStore = create<AuthState>(
//   devtools((set) => ({...}), { name: 'AuthStore' })
// );
