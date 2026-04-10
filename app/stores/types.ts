// Store Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImagePath?: string;
  authorTitle?: string;
  companyName?: string;
}

export type ApiResponse<T> = {
  status: number;
  error: boolean;
  message: string;
  data: T;
};

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export interface Post {
  postId: string;
  title: string;
  body: string;
  category: string;
  imageUrls: string[];
  authorId: string;
  firstName: string;
  lastName: string;
  profileImagePath: string;
  authorTitle: string;
  companyName: string;
  likeCount: number;
  commentCount: number;
  hasUserLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  setPosts: (posts: Post[]) => void;
  setCurrentPost: (post: Post | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addPost: (post: Post) => void;
  removePost: (postId: string) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  reset: () => void;
}

export interface Comment {
  commentId: string;
  comment: string;
  userId: string;
  firstName: string;
  lastName: string;
  profileImagePath: string;
  authorTitle: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface UIState {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  isLoading: boolean;
  notifications: Notification[];
  activeModal: string | null;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setActiveModal: (modalId: string | null) => void;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
