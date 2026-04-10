# Zustand as Source of Truth — Architecture Guide

## Overview

This architecture makes **Zustand the single source of truth** for all UI data:

```
API → Custom Hooks → Zustand Stores → Component Subscriptions → UI Re-renders
```

## The Pattern

### Instead of this (❌ Don't do):
```tsx
// Component manages data with useState
function Component() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => setPosts(d.data));
  }, []);
  
  return <div>{posts.map(...)}</div>;
}
```

### Do this instead (✅ Correct):
```tsx
// Hook handles data fetching and Zustand updates
function Component() {
  const { posts, isLoading } = useFetchPosts();
  return <div>{posts.map(...)}</div>;
}
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      ZUSTAND STORES                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ authStore    │  │ postsStore   │  │ usersStore   │   │
│  │              │  │              │  │              │   │
│  │ user, token  │  │ posts[]      │  │ users[]      │   │
│  │ isAuth       │  │ currentPost  │  │ isLoading    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
          ▲                    ▲                    ▲
          │                    │                    │
    [ custom hooks that populate stores ]
          │                    │                    │
  useFetchPosts()         useFetchUsers()    useAuthSync()
          │                    │                    │
          └────────┬───────────┴────────┬───────────┘
                   │                    │
            [ API responses ]     [ localStorage ]
                   │                    │
            ┌──────▼────────┐  ┌────────▼──────┐
            │  /api/posts   │  │ /api/users    │
            │  /api/auth    │  │ (more endpoints
            │  /api/users   │  │  as needed)
            └───────────────┘  └───────────────┘
```

## Key Files

- **`stores/`** — Core Zustand stores
- **`stores/hooks.ts`** — Custom hooks that fetch data and populate stores
- **`stores/examples/`** — Real-world component examples

## Data Flow Examples

### 1. Loading Posts from API

```
User opens Feed page
    ↓
Component calls: useFetchPosts()
    ↓
Hook: postsStore.setIsLoading(true)
    ↓
Hook calls: fetch('/api/posts')
    ↓
API returns: { status: 200, data: [posts...] }
    ↓
Hook: postsStore.setPosts(data.data)
    ↓
Zustand subscribers (component) re-render
    ↓
User sees posts on screen
```

### 2. Liking a Post

```
User clicks like button
    ↓
Component calls: toggleLike(postId)
    ↓
Hook: fetch('/api/posts/{postId}/like', { method: 'POST' })
    ↓
API returns: { liked: true, likeCount: 25 }
    ↓
Hook: store.updatePost(postId, { hasUserLiked: true, likeCount: 25 })
    ↓
Zustand notifies subscribers
    ↓
Component re-renders with new like count
```

### 3. Creating a Post

```
User submits form
    ↓
Form calls: createPost(formData)
    ↓
Hook: POST /api/posts with formData
    ↓
API returns: { postId: 'post_123' }
    ↓
Hook: showNotification('Post created!')
    ↓
Hook: refetchPosts() to update feed
    ↓
useFetchPosts populates: store.setPosts([newPost, ...oldPosts])
    ↓
Feed component re-renders with new post
```

## Using Hooks in Components

### Basic Usage

```tsx
import { useFetchPosts } from '@/stores/hooks';

function HomePage() {
  // Hook returns data from Zustand store + refetch function
  const { posts, isLoading, error, refetch } = useFetchPosts();
  
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {posts.map(post => <PostCard key={post.postId} post={post} />)}
    </div>
  );
}
```

### With Filters

```tsx
function AnnouncementsPage() {
  const { posts } = useFetchPosts({
    category: 'Announcement',
    limit: 20,
  });
  
  return posts.map(post => <PostCard key={post.postId} post={post} />);
}
```

### Manual Refetch

```tsx
function PostsWithRefresh() {
  const { posts, isLoading, refetch } = useFetchPosts();
  
  return (
    <div>
      <button onClick={refetch} disabled={isLoading}>
        Refresh Posts
      </button>
      {posts.map(post => <PostCard key={post.postId} post={post} />)}
    </div>
  );
}
```

## Mutations (Create, Update, Delete)

### Create Post

```tsx
import { useCreatePost, useFetchPosts } from '@/stores/hooks';

function CreatePostForm() {
  const { createPost, isLoading } = useCreatePost();
  const { refetch } = useFetchPosts();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await createPost(formData);
      // Success notification shown by hook
      // Now refetch to get updated posts
      refetch();
    } catch (error) {
      // Error already handled and notified by hook
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Update Post

```tsx
import { useUpdatePost } from '@/stores/hooks';

function EditPostForm({ postId }) {
  const { updatePost, isLoading } = useUpdatePost();
  
  const handleSave = async (updates) => {
    try {
      await updatePost(postId, updates);
      // Store automatically updated, component re-renders
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };
  
  return <button onClick={() => handleSave({title: 'New Title'})}>Save</button>;
}
```

### Delete Post

```tsx
import { useDeletePost } from '@/stores/hooks';

function PostActions({ postId }) {
  const { deletePost, isLoading } = useDeletePost();
  
  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    
    try {
      await deletePost(postId);
      // Store updated and component removed automatically
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };
  
  return <button onClick={handleDelete} disabled={isLoading}>Delete</button>;
}
```

## Direct Store Access

Sometimes you need to access store directly without hooks:

```tsx
import { usePostsStore, useAuthStore } from '@/stores';

function Component() {
  // Get current store state
  const posts = usePostsStore(state => state.posts);
  const user = useAuthStore(state => state.user);
  
  // Get all store state
  const postsStore = usePostsStore();
  
  // Call store actions directly
  const handleClear = () => {
    postsStore.reset();
  };
  
  return <div>{posts.length} posts || logged in as {user?.firstName}</div>;
}
```

## Best Practices

### ✅ Do's

1. **Use hooks for data fetching**
   ```tsx
   const { posts } = useFetchPosts();
   ```

2. **Keep component state minimal**
   ```tsx
   const [formInput, setFormInput] = useState(''); // OK: form input
   // NOT: const [posts, setPosts] = useState([]); // BAD
   ```

3. **Subscribe to only what you need**
   ```tsx
   const posts = usePostsStore(state => state.posts); // Good
   // NOT: const store = usePostsStore(); // Causes excess re-renders
   ```

4. **Use refetch for manual updates**
   ```tsx
   const { refetch } = useFetchPosts();
   await createPost(data);
   refetch();
   ```

5. **Let hooks handle errors and notifications**
   ```tsx
   await deletePost(id); // Hook shows error notification
   // NOT: try-catch for UI notifications in component
   ```

### ❌ Don'ts

1. ❌ **Don't fetch in components**
   ```tsx
   // BAD
   useEffect(() => {
     fetch('/api/posts').then(r => r.json()).then(d => setPosts(d.data));
   }, []);
   ```

2. ❌ **Don't duplicate data in component state**
   ```tsx
   // BAD
   const [posts, setPosts] = useState([]);
   useEffect(() => {
     const data = usePostsStore(state => state.posts);
     setPosts(data);
   }, []);
   ```

3. ❌ **Don't update store directly in components**
   ```tsx
   // BAD
   const store = usePostsStore();
   store.setPosts(newPosts); // Use hooks instead
   ```

4. ❌ **Don't pass data as props when you can use store**
   ```tsx
   // BAD
   <PostsList posts={posts} users={users} />
   
   // GOOD
   function PostsList() {
     const posts = usePostsStore(state => state.posts);
     const users = useUsersStore(state => state.users);
   }
   ```

## Common Patterns

### Pattern 1: Fetch on Mount

```tsx
function Component() {
  const { data, isLoading } = useFetchData();
  
  // Hook automatically fetches on mount via useEffect
  return <div>{isLoading ? 'Loading...' : data}</div>;
}
```

### Pattern 2: Conditional Fetch

```tsx
function Component({ userId }) {
  const { data } = useFetchUser(userId);
  
  // Hook fetches when userId changes
  return <div>{data?.name}</div>;
}
```

### Pattern 3: Infinite Scroll

```tsx
function Component() {
  const { posts, isLoading } = useFetchPosts({ page: 1, limit: 20 });
  const [page, setPage] = useState(1);
  
  // Hook refetch with new page
  const loadMore = () => setPage(p => p + 1);
  
  return (
    <div>
      {posts.map(p => <Post key={p.id} post={p} />)}
      <button onClick={loadMore} disabled={isLoading}>Load More</button>
    </div>
  );
}
```

### Pattern 4: Search/Filter

```tsx
function Component() {
  const [search, setSearch] = useState('');
  const { posts } = useFetchPosts({ search });
  
  // Hook re-fetches whenever search changes
  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      {posts.map(p => <Post key={p.id} post={p} />)}
    </div>
  );
}
```

## Persistence

### Auto-Save to localStorage

```tsx
// In root layout/app component
import { useAuthSync } from '@/stores/hooks';

function RootLayout() {
  useAuthSync(); // Saves auth to localStorage on change
  
  return <Outlet />;
}
```

### Restore from localStorage

```tsx
// useAuthSync hook already does this on mount
// Auth is automatically restored when app loads
```

## Summary

| Aspect | Solution |
|--------|----------|
| Where is data? | Zustand stores |
| How is it fetched? | Custom hooks (useFetch*) |
| How do components get data? | Hook subscriptions or direct store access |
| How does data update? | API → Hook → Store → Component re-render |
| Where is component state? | Only form inputs and local UI state |
| How to handle errors? | Hooks show notifications automatically |
| How to refetch? | Call `refetch()` function from hook |

This pattern gives you:
- ✅ Single source of truth
- ✅ No prop drilling
- ✅ Automatic updates across app
- ✅ Clean component code
- ✅ Easy debugging with Zustand devtools
