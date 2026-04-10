import { create } from 'zustand';
import type { PostsState, Post } from './types';

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,

  setPosts: (posts: Post[]) =>
    set({ posts }),

  setCurrentPost: (post: Post | null) =>
    set({ currentPost: post }),

  setIsLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  addPost: (post: Post) =>
    set((state) => ({
      posts: [post, ...state.posts],
    })),

  removePost: (postId: string) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.postId !== postId),
      currentPost:
        state.currentPost?.postId === postId
          ? null
          : state.currentPost,
    })),

  updatePost: (postId: string, updates: Partial<Post>) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.postId === postId ? { ...p, ...updates } : p
      ),
      currentPost:
        state.currentPost?.postId === postId
          ? { ...state.currentPost, ...updates }
          : state.currentPost,
    })),

  reset: () =>
    set({
      posts: [],
      currentPost: null,
      isLoading: false,
      error: null,
    }),
}));
