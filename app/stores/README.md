# Zustand Store Setup

This directory contains all Zustand stores for state management. Each store manages a specific domain of your application.

## Store Overview

### 1. **authStore** (`useAuthStore`)
Manages authentication state and user information.

**Usage:**
```tsx
import { useAuthStore } from '@/stores';

function MyComponent() {
  const { user, isAuthenticated, token } = useAuthStore();
  const { setUser, logout } = useAuthStore();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

---

### 2. **uiStore** (`useUIStore`)
Manages global UI state: theme, sidebar, modals, notifications.

**Usage:**
```tsx
import { useUIStore, showNotification } from '@/stores';

function MyComponent() {
  const { isDarkMode, isSidebarOpen, toggleDarkMode, toggleSidebar } = 
    useUIStore();

  const handleSave = async () => {
    try {
      // Your save logic
      showNotification('Saved successfully!', 'success');
    } catch (error) {
      showNotification('Error saving', 'error');
    }
  };

  return (
    <div>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

---

### 3. **postsStore** (`usePostsStore`)
Manages newsfeed posts, comments, and engagement data.

**Usage:**
```tsx
import { usePostsStore } from '@/stores';
import { Post } from '@/stores/types';

function PostsList() {
  const { posts, isLoading, error, setPosts, addPost, updatePost } = 
    usePostsStore();

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch('/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPosts(data.data);
    };
    fetchPosts();
  }, []);

  // Like a post
  const handleLike = (postId: string, isLiked: boolean) => {
    updatePost(postId, {
      hasUserLiked: !isLiked,
      likeCount: isLiked 
        ? likeCount - 1 
        : likeCount + 1
    });
  };

  return (
    <div>
      {posts.map(post => (
        <div key={post.postId}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <button onClick={() => handleLike(post.postId, post.hasUserLiked)}>
            ❤️ {post.likeCount}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### 4. **usersStore** (`useUsersStore`)
Manages user directory and contacts.

**Usage:**
```tsx
import { useUsersStore } from '@/stores';

function UserDirectory() {
  const { users, isLoading, setUsers } = useUsersStore();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.data);
    };
    fetchUsers();
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.firstName} {user.lastName} - {user.authorTitle}
        </li>
      ))}
    </ul>
  );
}
```

---

### 5. **opportunitiesStore** (`useOpportunitiesStore`)
Manages opportunities and career/business opportunities.

**Usage:**
```tsx
import { useOpportunitiesStore } from '@/stores';

function OpportunitiesList() {
  const { 
    opportunities, 
    currentOpportunity, 
    setCurrentOpportunity,
    addOpportunity 
  } = useOpportunitiesStore();

  const handleSelectOpportunity = (id: string) => {
    const opp = opportunities.find(o => o.id === id);
    setCurrentOpportunity(opp || null);
  };

  return (
    <div>
      {opportunities.map(opp => (
        <div key={opp.id} onClick={() => handleSelectOpportunity(opp.id)}>
          {opp.title}
        </div>
      ))}
      {currentOpportunity && (
        <div>
          <h3>{currentOpportunity.title}</h3>
          <p>{currentOpportunity.description}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Key Patterns

### Selective State Subscription (Performance Optimization)
```tsx
// ✅ Only re-render when user changes
const user = useAuthStore(state => state.user);

// ✅ Only re-render when posts change
const posts = usePostsStore(state => state.posts);

// ❌ Re-renders on any state change
const store = useAuthStore();
```

### Hydration from localStorage
```tsx
// app/root.tsx or app/routes/layout.tsx
useEffect(() => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    const { user, token } = JSON.parse(savedAuth);
    useAuthStore.setState({ user, token, isAuthenticated: true });
  }
}, []);
```

### Error Handling
```tsx
const handleFetch = async () => {
  const store = postsStore;
  store.setIsLoading(true);
  try {
    const response = await fetch('/api/posts');
    const data = await response.json();
    store.setPosts(data.data);
    store.setError(null);
  } catch (error) {
    store.setError(error.message);
  } finally {
    store.setIsLoading(false);
  }
};
```

---

## Best Practices

1. **Use selective subscriptions** - Subscribe only to the state you need to avoid unnecessary re-renders
2. **Keep stores normalized** - Store data in simple structures, not nested objects
3. **Use actions for complex logic** - Put business logic in store actions, not components
4. **Separate concerns** - Each store handles one domain
5. **Type everything** - Always type your state and actions for TypeScript safety

---

## TypeScript Support

All stores are fully typed with TypeScript. You get autocomplete and type checking:

```tsx
import { useAuthStore, usePostsStore } from '@/stores';
import type { User, Post } from '@/stores/types';

const user: User | null = useAuthStore(state => state.user);
const posts: Post[] = usePostsStore(state => state.posts);
```

---

## Migration Notes

If you're coming from Redux, Context API, or Recoil:

- **No Provider needed** - Zustand stores work without wrapping your app
- **No selectors boilerplate** - Just use `store(state => state.property)`
- **Smaller bundle** - Zustand is ~2kb vs Redux ~40kb
- **Better DevTools support** - Optional with `devtools` middleware
