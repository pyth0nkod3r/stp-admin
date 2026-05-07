import { create } from 'zustand';
import type { User } from '@/lib/type';

export interface UsersState {
  users: User[];
  allUsers: User[];
  isLoading: boolean;
  allUsersLoading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
  setAllUsers: (users: User[]) => void;
  setIsLoading: (loading: boolean) => void;
  setAllUsersLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  getUserById: (userId: string) => User | undefined;
  reset: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  allUsers: [],
  isLoading: false,
  allUsersLoading: false,
  error: null,

  setUsers: (users: User[]) =>
    set({ users }),

  setAllUsers: (users: User[]) =>
    set({ allUsers: users }),

  setIsLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setAllUsersLoading: (loading: boolean) =>
    set({ allUsersLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  addUser: (user: User) =>
    set((state) => ({
      users: [...state.users, user],
      allUsers: [...state.allUsers, user],
    })),

  removeUser: (userId: string) =>
    set((state) => ({
      users: state.users.filter((u) => u.userId !== userId),
      allUsers: state.allUsers.filter((u) => u.userId !== userId),
    })),

  updateUser: (userId: string, updates: Partial<User>) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.userId === userId ? { ...u, ...updates } : u
      ),
      allUsers: state.allUsers.map((u) =>
        u.userId === userId ? { ...u, ...updates } : u
      ),
    })),

  getUserById: (userId: string) => {
    return get().allUsers.find((u) => u.userId === userId);
  },

  reset: () =>
    set({
      users: [],
      allUsers: [],
      isLoading: false,
      allUsersLoading: false,
      error: null,
    }),
}));
