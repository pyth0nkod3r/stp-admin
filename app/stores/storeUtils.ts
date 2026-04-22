// Store utilities and helpers

import { useAuthStore } from './authStore';
import { usePostsStore } from './postsStore';
import { useUsersStore } from './usersStore';
import { useOpportunitiesStore } from './opportunitiesStore';
import { showNotification } from './uiStore';
import type { Post, Opportunity, ApiResponse } from './types';
import type { User } from '@/lib/type';

/**
 * Initialize auth from localStorage
 * Call this in your root layout/app component
 */
export const initializeAuthFromStorage = () => {
  const saved = localStorage.getItem('auth-storage');
  if (saved) {
    try {
      const { user, token, isAuthenticated } = JSON.parse(saved);
      const authStore = useAuthStore.getState();
      if (user) authStore.setUser(user);
      if (token) authStore.setToken(token);
      authStore.setIsAuthenticated(isAuthenticated);
    } catch (error) {
      console.error('Failed to initialize auth from storage', error);
    }
  }
};

/**
 * Generic fetch handler with error management
 */
export const fetchWithStore = async <T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T> | null> => {
  const authStore = useAuthStore.getState();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        authStore.logout();
        showNotification('Session expired. Please log in again.', 'error');
        return null;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    showNotification(message, 'error');
    console.error('Fetch error:', error);
    return null;
  }
};

/**
 * Fetch posts from API and update store
 */
export const fetchPosts = async (filters?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const postsStore = usePostsStore.getState();
  postsStore.setIsLoading(true);

  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const data = await fetchWithStore<Post[]>(`/api/posts?${params.toString()}`);
    
    if (data) {
      postsStore.setPosts(data.data);
      postsStore.setError(null);
    }
  } catch (error) {
    postsStore.setError(
      error instanceof Error ? error.message : 'Failed to fetch posts'
    );
  } finally {
    postsStore.setIsLoading(false);
  }
};

/**
 * Fetch single post by ID
 */
export const fetchPostById = async (postId: string) => {
  const postsStore = usePostsStore.getState();
  postsStore.setIsLoading(true);

  try {
    const data = await fetchWithStore<Post>(`/api/posts/${postId}`);
    
    if (data) {
      postsStore.setCurrentPost(data.data);
      postsStore.setError(null);
    }
  } catch (error) {
    postsStore.setError(
      error instanceof Error ? error.message : 'Failed to fetch post'
    );
  } finally {
    postsStore.setIsLoading(false);
  }
};

/**
 * Create a new post (admin only)
 */
export const createPost = async (formData: FormData) => {
  const authStore = useAuthStore.getState();
  const postsStore = usePostsStore.getState();

  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    const data = await response.json();
    showNotification('Post created successfully!', 'success');
    
    // Refresh posts list
    await fetchPosts();
    return data.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create post';
    showNotification(message, 'error');
    throw error;
  }
};

/**
 * Like or unlike a post
 */
export const toggleLikePost = async (postId: string) => {
  const authStore = useAuthStore.getState();
  const postsStore = usePostsStore.getState();

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
    const currentPost = postsStore.posts.find(p => p.postId === postId);
    
    if (currentPost) {
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
};

/**
 * Fetch users and update store
 */
export const fetchUsers = async () => {
  const usersStore = useUsersStore.getState();
  usersStore.setIsLoading(true);

  try {
    const data = await fetchWithStore<User[]>('/api/users');
    
    if (data) {
      usersStore.setUsers(data.data);
      usersStore.setError(null);
    }
  } catch (error) {
    usersStore.setError(
      error instanceof Error ? error.message : 'Failed to fetch users'
    );
  } finally {
    usersStore.setIsLoading(false);
  }
};

/**
 * Fetch opportunities and update store
 */
export const fetchOpportunities = async () => {
  const oppStore = useOpportunitiesStore.getState();
  oppStore.setIsLoading(true);

  try {
    const data = await fetchWithStore<Opportunity[]>('/api/opportunities');
    
    if (data) {
      oppStore.setOpportunities(data.data);
      oppStore.setError(null);
    }
  } catch (error) {
    oppStore.setError(
      error instanceof Error ? error.message : 'Failed to fetch opportunities'
    );
  } finally {
    oppStore.setIsLoading(false);
  }
};

/**
 * Persist auth store to localStorage
 * Call this whenever auth state changes
 */
export const persistAuthToStorage = () => {
  const authStore = useAuthStore.getState();
  const toSave = {
    user: authStore.user,
    token: authStore.token,
    isAuthenticated: authStore.isAuthenticated,
  };
  localStorage.setItem('auth-storage', JSON.stringify(toSave));
};
