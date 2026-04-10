import { useEffect, useCallback } from 'react';
import { useAuthStore } from './authStore';
import { usePostsStore } from './postsStore';
import { useUsersStore } from './usersStore';
import { useOpportunitiesStore } from './opportunitiesStore';
import { useUIStore, showNotification } from './uiStore';
import { fetchWithStore } from './storeUtils';
import type { Post, User, Opportunity, ApiResponse } from './types';

/**
 * Hook: Fetch posts and populate store
 * Components should use this hook to load posts
 */
export const useFetchPosts = (filters?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const postsStore = usePostsStore();
  const isLoading = postsStore.isLoading;

  const fetchPosts = useCallback(async () => {
    postsStore.setIsLoading(true);
    postsStore.setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const data = await fetchWithStore<Post[]>(
        `/api/posts?${params.toString()}`
      );

      if (data) {
        postsStore.setPosts(data.data);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch posts';
      postsStore.setError(message);
    } finally {
      postsStore.setIsLoading(false);
    }
  }, [filters, postsStore]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts: postsStore.posts,
    isLoading,
    error: postsStore.error,
    refetch: fetchPosts,
  };
};

/**
 * Hook: Fetch single post by ID and update store
 */
export const useFetchPostById = (postId?: string) => {
  const postsStore = usePostsStore();
  const isLoading = postsStore.isLoading;

  const fetchPostById = useCallback(async () => {
    if (!postId) return;

    postsStore.setIsLoading(true);
    postsStore.setError(null);

    try {
      const data = await fetchWithStore<Post>(`/api/posts/${postId}`);

      if (data) {
        postsStore.setCurrentPost(data.data);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch post';
      postsStore.setError(message);
    } finally {
      postsStore.setIsLoading(false);
    }
  }, [postId, postsStore]);

  useEffect(() => {
    if (postId) {
      fetchPostById();
    }
  }, [postId, fetchPostById]);

  return {
    post: postsStore.currentPost,
    isLoading,
    error: postsStore.error,
    refetch: fetchPostById,
  };
};

/**
 * Hook: Create post (admin only)
 */
export const useCreatePost = () => {
  const authStore = useAuthStore();
  const postsStore = usePostsStore();
  const uiStore = useUIStore();

  const createPost = useCallback(
    async (formData: FormData) => {
      uiStore.setIsLoading(true);

      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 403) {
            showNotification('Only admins can create posts', 'error');
            throw new Error('Unauthorized');
          }
          throw new Error('Failed to create post');
        }

        const data = await response.json();
        showNotification('Post created successfully!', 'success');

        // Refresh posts list to include the new post
        // Call fetchPosts separately to refresh
        return data.data;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to create post';
        showNotification(message, 'error');
        throw error;
      } finally {
        uiStore.setIsLoading(false);
      }
    },
    [authStore.token, uiStore]
  );

  return {
    createPost,
    isLoading: uiStore.isLoading,
  };
};

/**
 * Hook: Update post (admin only)
 */
export const useUpdatePost = () => {
  const authStore = useAuthStore();
  const postsStore = usePostsStore();
  const uiStore = useUIStore();

  const updatePost = useCallback(
    async (postId: string, updates: Partial<Post>) => {
      uiStore.setIsLoading(true);

      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update post');
        }

        // Update store with optimistic update
        postsStore.updatePost(postId, updates);
        showNotification('Post updated successfully!', 'success');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update post';
        showNotification(message, 'error');
        throw error;
      } finally {
        uiStore.setIsLoading(false);
      }
    },
    [authStore.token, postsStore, uiStore]
  );

  return { updatePost, isLoading: uiStore.isLoading };
};

/**
 * Hook: Delete post (admin only)
 */
export const useDeletePost = () => {
  const authStore = useAuthStore();
  const postsStore = usePostsStore();
  const uiStore = useUIStore();

  const deletePost = useCallback(
    async (postId: string) => {
      uiStore.setIsLoading(true);

      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete post');
        }

        postsStore.removePost(postId);
        showNotification('Post deleted successfully!', 'success');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete post';
        showNotification(message, 'error');
        throw error;
      } finally {
        uiStore.setIsLoading(false);
      }
    },
    [authStore.token, postsStore, uiStore]
  );

  return { deletePost, isLoading: uiStore.isLoading };
};

/**
 * Hook: Like/unlike post
 */
export const useLikePost = () => {
  const authStore = useAuthStore();
  const postsStore = usePostsStore();

  const toggleLike = useCallback(
    async (postId: string) => {
      try {
        const response = await fetch(`/api/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to like post');
        }

        const data = await response.json();

        // Update store
        const post = postsStore.posts.find((p) => p.postId === postId);
        if (post) {
          postsStore.updatePost(postId, {
            hasUserLiked: data.data.liked,
            likeCount: data.data.likeCount,
          });
        }

        return data.data;
      } catch (error) {
        console.error('Error liking post:', error);
        throw error;
      }
    },
    [authStore.token, postsStore]
  );

  return { toggleLike };
};

/**
 * Hook: Fetch users and populate store
 */
export const useFetchUsers = () => {
  const usersStore = useUsersStore();
  const isLoading = usersStore.isLoading;

  const fetchUsers = useCallback(async () => {
    usersStore.setIsLoading(true);
    usersStore.setError(null);

    try {
      const data = await fetchWithStore<User[]>('/api/users');

      if (data) {
        usersStore.setUsers(data.data);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch users';
      usersStore.setError(message);
    } finally {
      usersStore.setIsLoading(false);
    }
  }, [usersStore]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: usersStore.users,
    isLoading,
    error: usersStore.error,
    refetch: fetchUsers,
  };
};

/**
 * Hook: Fetch opportunities and populate store
 */
export const useFetchOpportunities = () => {
  const oppStore = useOpportunitiesStore();
  const isLoading = oppStore.isLoading;

  const fetchOpportunities = useCallback(async () => {
    oppStore.setIsLoading(true);
    oppStore.setError(null);

    try {
      const data = await fetchWithStore<Opportunity[]>('/api/opportunities');

      if (data) {
        oppStore.setOpportunities(data.data);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch opportunities';
      oppStore.setError(message);
    } finally {
      oppStore.setIsLoading(false);
    }
  }, [oppStore]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return {
    opportunities: oppStore.opportunities,
    isLoading,
    error: oppStore.error,
    refetch: fetchOpportunities,
  };
};

/**
 * Hook: Subscribe to auth changes and sync to localStorage
 */
export const useAuthSync = () => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Save to localStorage whenever auth changes
    const data = {
      user: authStore.user,
      token: authStore.token,
      isAuthenticated: authStore.isAuthenticated,
    };
    localStorage.setItem('auth-storage', JSON.stringify(data));
  }, [authStore.user, authStore.token, authStore.isAuthenticated]);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('auth-storage');
    if (saved) {
      try {
        const { user, token, isAuthenticated } = JSON.parse(saved);
        if (user) authStore.setUser(user);
        if (token) authStore.setToken(token);
        authStore.setIsAuthenticated(isAuthenticated);
      } catch (error) {
        console.error('Failed to restore auth', error);
      }
    }
  }, [authStore]);
};
