/**
 * EXAMPLE COMPONENT: Post Detail Page
 * 
 * Shows how to:
 * - Load single post using useFetchPostById with ID from URL
 * - Subscribe to specific post from Zustand
 * - Update post content automatically
 */

import { useFetchPostById, useUpdatePost, useDeletePost } from '@/stores/hooks';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface PostDetailExampleProps {
  postId: string; // Typically from URL params
}

export function PostDetailExample({ postId }: PostDetailExampleProps) {
  const navigate = useNavigate();
  const { post, isLoading, error } = useFetchPostById(postId);
  const { updatePost } = useUpdatePost();
  const { deletePost } = useDeletePost();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePost(postId);
      // Navigate back after deletion
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = async () => {
    // Example: Update category
    if (post) {
      try {
        await updatePost(postId, {
          category: 'Industry Update', // Changed category
        });
        // Zustand store automatically updates
        // Component re-renders with new data
      } catch (error) {
        console.error('Failed to update:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Error: {error || 'Post not found'}</p>
        <Button
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Go Back
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-4xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded mt-2 text-sm">
              {post.category}
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEdit} variant="outline">
              Edit
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </div>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3 py-3 border-y">
          {post.profileImagePath && (
            <img
              src={post.profileImagePath}
              alt={post.firstName}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <p className="font-semibold">
              {post.firstName} {post.lastName}
            </p>
            <p className="text-sm text-gray-600">
              {post.authorTitle} • {post.companyName}
            </p>
          </div>
          <p className="text-xs text-gray-500 ml-auto">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          <p>{post.body}</p>
        </div>

        {/* Images */}
        {post.imageUrls.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold">Images</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {post.imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Post attachment ${i + 1}`}
                  className="rounded-lg object-cover w-full h-32"
                />
              ))}
            </div>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex gap-6 py-3 border-t text-gray-600">
          <span>❤️ {post.likeCount} likes</span>
          <span>💬 {post.commentCount} comments</span>
        </div>

        {/* Back Button */}
        <Button onClick={() => navigate('/')} variant="outline" className="w-full">
          Back to Feed
        </Button>
      </div>
    </Card>
  );
}

/**
 * DATA FLOW:
 * 
 * 1. Component mounts with postId from URL
 * 2. useFetchPostById hook is called with postId parameter
 * 3. Hook fetches from API and stores in Zustand
 * 4. Component gets post data from hook return value
 * 5. When user edits/deletes:
 *    - useUpdatePost or useDeletePost is called
 *    - API is called
 *    - Zustand store updates
 *    - Component re-renders with new data automatically
 * 
 * NO manual state management needed!
 */
