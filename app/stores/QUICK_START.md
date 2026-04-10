# Zustand Architecture — Quick Start

## ✅ Zustand is Now Your Source of Truth

Your app now has a complete data management architecture where **Zustand stores are the single source of truth**:

```
API Call → Zustand Store Updates → Components Re-render
```

## 📁 What Was Created

### Core Files (Production Ready)
- **`stores/authStore.ts`** — Authentication state
- **`stores/uiStore.ts`** — Global UI state (theme, modals, notifications)
- **`stores/postsStore.ts`** — Posts and newsfeed data
- **`stores/usersStore.ts`** — User directory data
- **`stores/opportunitiesStore.ts`** — Opportunities data
- **`stores/hooks.ts`** — ⭐ Custom hooks that fetch data and populate stores
- **`stores/storeUtils.ts`** — API utilities and helpers
- **`stores/types.ts`** — TypeScript type definitions

### Examples (Reference Only)
- **`stores/examples/ARCHITECTURE.md`** — Complete architecture guide
- **`stores/examples/PostsFeedExample.tsx`** — How to display posts
- **`stores/examples/CreatePostExample.tsx`** — How to create posts
- **`stores/examples/PostDetailExample.tsx`** — How to show single post
- **`stores/examples/UsersDirectoryExample.tsx`** — How to list users
- **`stores/examples/AppInitializerExample.tsx`** — How to setup auth & initialization

> **Note:** Example files are for reference. Import paths may differ in your project—adjust to your actual component paths.

## 🚀 The Pattern (In Action)

### Before (Data scattered in components)
```tsx
function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => setPosts(d.data));
  }, []);
  
  return posts.map(p => <Post key={p.id} post={p} />);
}
```

### After (Data in Zustand stores, components just subscribe)
```tsx
function Feed() {
  const { posts, isLoading } = useFetchPosts();
  return posts.map(p => <Post key={p.id} post={p} />);
}
```

## 📖 Using Hooks in Your Components

### 1. Fetch Posts
```tsx
import { useFetchPosts } from '@/stores/hooks';

function MyComponent() {
  const { posts, isLoading, error, refetch } = useFetchPosts({
    category: 'Announcement',
    limit: 20,
  });
  
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {posts.map(post => <div key={post.postId}>{post.title}</div>)}
    </div>
  );
}
```

### 2. Fetch Single Post
```tsx
import { useFetchPostById } from '@/stores/hooks';

function PostDetail({ postId }) {
  const { post, isLoading, error } = useFetchPostById(postId);
  return <div>{post?.title}</div>;
}
```

### 3. Create Post
```tsx
import { useCreatePost } from '@/stores/hooks';

function CreatePostForm() {
  const { createPost, isLoading } = useCreatePost();
  
  const handleSubmit = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('body', data.body);
    formData.append('category', data.category);
    
    await createPost(formData);
    // Success notification shown automatically
    // Store updated automatically
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 4. Like a Post
```tsx
import { useLikePost } from '@/stores/hooks';

function PostCard({ post }) {
  const { toggleLike } = useLikePost();
  
  const handleLike = async () => {
    await toggleLike(post.postId);
    // Store updates → component re-renders automatically
  };
  
  return (
    <div>
      <h3>{post.title}</h3>
      <button onClick={handleLike}>
        ❤️ {post.likeCount}
      </button>
    </div>
  );
}
```

### 5. Fetch Users
```tsx
import { useFetchUsers } from '@/stores/hooks';

function UsersList() {
  const { users, isLoading } = useFetchUsers();
  return users.map(u => <div key={u.id}>{u.firstName}</div>);
}
```

### 6. Update Post (Admin)
```tsx
import { useUpdatePost } from '@/stores/hooks';

function EditPost({ postId }) {
  const { updatePost, isLoading } = useUpdatePost();
  
  const handleSave = async (updates) => {
    await updatePost(postId, {
      title: 'New Title',
      category: 'Industry Update',
    });
    // Store and UI automatically update
  };
  
  return <button onClick={handleSave}>Save Changes</button>;
}
```

### 7. Delete Post (Admin)
```tsx
import { useDeletePost } from '@/stores/hooks';

function DeletepostButton({ postId }) {
  const { deletePost, isLoading } = useDeletePost();
  
  const handleDelete = async () => {
    await deletePost(postId);
    // Post removed from store → feed updates automatically
  };
  
  return <button onClick={handleDelete}>Delete</button>;
}
```

## 🔄 Auth Setup

### In Your Root Component
```tsx
import { useAuthSync } from '@/stores/hooks';

function RootLayout() {
  useAuthSync(); // Restores auth from localStorage on mount
  
  return <Outlet />;
}
```

### After Login
```tsx
import { useAuthStore, showNotification } from '@/stores';

function LoginForm() {
  const authStore = useAuthStore();
  
  const handleLogin = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const { data } = await response.json();
    
    // Update Zustand store
    authStore.setUser(data.user);
    authStore.setToken(data.token);
    authStore.setIsAuthenticated(true);
    
    showNotification('Logged in!', 'success');
    // useAuthSync saves to localStorage automatically
  };
}
```

### After Logout
```tsx
import { useAuthStore } from '@/stores';

function LogoutButton() {
  const authStore = useAuthStore();
  
  const handleLogout = () => {
    authStore.logout();
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

## 📊 Data Flow Diagram

```
┌────────────────────────────────────────────────────────┐
│                   YOUR COMPONENTS                       │
│  Feed | PostDetail | CreatePost | UsersList            │
└─────────────────────┬──────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
    Call Hooks           Read from Store
    useFetch*() ────────> usePostsStore()
    useCreate*() ─────┐   
    useUpdate*()      │   
                      ▼
            ┌──────────────────────┐
            │  ZUSTAND STORES      │
            │  authStore           │
            │  postsStore  ✨       │
            │  usersStore          │
            │  uiStore             │
            └──────────────────────┘
                      ▲
                      │
                 API Calls
                 /api/posts
                 /api/users
                 /api/auth
```

## ✨ Key Features

✅ **No Provider needed** — Just import and use stores  
✅ **Automatic notifications** — Errors/success shown automatically  
✅ **Auto localStorage sync** — Auth persists across reloads  
✅ **Optimistic updates** — UI updates before server confirms  
✅ **Loading states** — Built into every hook  
✅ **Error handling** — Centralized in hooks  
✅ **Type safety** — Full TypeScript support  
✅ **No prop drilling** — Direct store access anywhere  

## 🎯 Recommended Usage

### ✅ DO

```tsx
// Use hooks to fetch data
const { posts } = useFetchPosts();
const { users } = useFetchUsers();

// Read from store
const user = useAuthStore(state => state.user);
const isDark = useUIStore(state => state.isDarkMode);

// Only manage form state locally
const [formInput, setFormInput] = useState('');
```

### ❌ DON'T

```tsx
// Don't fetch in components
useEffect(() => { fetch(...) }, []);

// Don't duplicate data
const [posts, setPosts] = useState([]);

// Don't update store directly
store.setPosts(data); // Use hooks instead

// Don't pass everything as props
<Feed posts={posts} users={users} ui={ui} />
```

## 📚 Full Documentation

See **`stores/examples/ARCHITECTURE.md`** for:
- Complete architecture explanation
- Advanced patterns (infinite scroll, pagination, etc.)
- Best practices and anti-patterns
- Component examples with explanations

## 🔗 Import Everything From

```tsx
import { 
  // Hooks for data fetching
  useFetchPosts,
  useFetchPostById,
  useFetchUsers,
  useFetchOpportunities,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useLikePost,
  useAuthSync,
  
  // Stores for direct access
  useAuthStore,
  usePostsStore,
  useUsersStore,
  useUIStore,
  useOpportunitiesStore,
  
  // Utilities
  showNotification,
  fetchWithStore,
  
  // Types
  type Post,
  type User,
  type Opportunity,
  type AuthState,
  type UIState,
} from '@/stores';
```

## 🚨 Troubleshooting

### Components not re-rendering after API call?
- Make sure you're using the hook, not calling action manually
- Use `useFetchPosts()` not `fetchPosts()` directly

### Getting `Cannot find module` errors?
- Adjust imports to match your project structure
- Examples use `@/app/components/` but your paths may differ

### Store not persisting after reload?
- Make sure `useAuthSync()` is in your root component
- It automatically saves to localStorage

### Notifications not showing?
- `showNotification()` is called automatically by hooks
- Or call it manually: `showNotification('Hello!', 'success')`

## 🎓 Next Steps

1. **Examine examples**: Check `stores/examples/` for reference patterns
2. **Replace existing code**: Update your components to use hooks
3. **Test the flow**: Verify API → Store → UI works as expected
4. **Add more stores**: Follow the same pattern for other data domains

Your new architecture is:
- **Cleaner** — No component state management for API data
- **Scalable** — Easy to add new stores and hooks
- **Maintainable** — Single source of truth
- **Debuggable** — Zustand dev tools available

Happy coding! 🚀
