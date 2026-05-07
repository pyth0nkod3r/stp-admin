/**
 * EXAMPLE COMPONENT: Posts Feed
 * 
 * Shows how to:
 * - Use useFetchPosts hook to fetch and populate Zustand store
 * - Subscribe to posts from store
 * - Re-render when store updates
 * - Handle loading/error states from store
 */

import { useFetchPosts, useLikePost } from '@/stores/hooks';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Loader } from '@/app/components/Loader';

export function PostsFeedExample() {
  // Hook fetches data and returns current state from Zustand
  const { posts, isLoading, error, refetch } = useFetchPosts({
    category: 'Announcement',
    limit: 20,
    page: 1,
  });

  const { toggleLike } = useLikePost();

  const handleRefresh = () => {
    refetch();
  };

  const handleLike = async (postId: string, hasLiked: boolean) => {
    try {
      await toggleLike(postId);
      // No need to update UI manually — Zustand store updates automatically
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  if (isLoading && posts.length === 0) {
    return <Loader />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">News Feed</h2>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No posts found
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.postId} className="p-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-600">{post.category}</p>
                <p className="text-gray-800">{post.body}</p>

                {post.imageUrls.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {post.imageUrls.slice(0, 3).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Post"
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <button
                    onClick={() =>
                      handleLike(post.postId, post.hasUserLiked)
                    }
                    className={`flex items-center gap-1 ${
                      post.hasUserLiked ? 'text-red-600' : ''
                    }`}
                  >
                    ❤️ {post.likeCount}
                  </button>
                  <span>💬 {post.commentCount}</span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  By {post.firstName} {post.lastName} •{' '}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * WHY THIS PATTERN WORKS:
 *
 * 1. Data flow: API → useFetchPosts hook → Zustand store → Component re-renders
 * 2. Single source of truth: All posts are in Zustand, not scattered in component state
 * 3. Automatic updates: When store updates, component re-renders automatically
 * 4. No manual state management: No useState for posts, loading, errors
 * 5. Refetching easy: Just call refetch() function from hook
 * 6. Like actions update store: User likes post → API called → Store updated → UI re-renders
 */
