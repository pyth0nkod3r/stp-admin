import { create } from 'zustand';
import type { User } from './types';

export interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  getUserById: (userId: string) => User | undefined;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  setUsers: (users: User[]) =>
    set({ users }),

  setIsLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  addUser: (user: User) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  removeUser: (userId: string) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),

  updateUser: (userId: string, updates: Partial<User>) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, ...updates } : u
      ),
    })),

  getUserById: (userId: string) => {
    return get().users.find((u) => u.id === userId);
  },
}));
