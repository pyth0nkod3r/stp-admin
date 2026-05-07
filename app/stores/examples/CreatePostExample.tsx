/**
 * EXAMPLE COMPONENT: Create Post Form
 * 
 * Shows how to:
 * - Use useCreatePost hook to submit form data
 * - Show loading state from hook
 * - Handle form submission without managing post creation state
 */

import { useState } from 'react';
import { useCreatePost, useFetchPosts } from '@/stores/hooks';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

const CATEGORIES = [
  'Announcement',
  'Industry Update',
  'Spotlight',
  'Event',
  'Opportunity',
];

export function CreatePostExample() {
  const { createPost, isLoading } = useCreatePost();
  const { refetch: refetchPosts } = useFetchPosts();

  // Only manage form input state, not post creation state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Announcement');
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Build FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    formData.append('category', category);
    images.forEach((img) => {
      formData.append('postImages', img);
    });

    try {
      // Call hook which handles API, errors, notifications
      await createPost(formData);

      // Reset form
      setTitle('');
      setBody('');
      setCategory('Announcement');
      setImages([]);

      // Refresh posts list to show new post
      refetchPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      // Error is already shown by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block font-semibold mb-2">Title *</label>
        <Input
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Enter post title"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Content *</label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your post content here"
          rows={6}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Category *</label>
        <Select value={category} onValueChange={setCategory} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block font-semibold mb-2">
          Images (optional - max 5)
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          maxLength={5}
          disabled={isLoading}
          className="block w-full"
        />
        {images.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {images.length} file(s) selected
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !title || !body}
        className="w-full"
      >
        {isLoading ? 'Creating...' : 'Create Post'}
      </Button>
    </form>
  );
}

/**
 * KEY POINTS:
 *
 * 1. Form input state: Manage locally in component (title, body, images)
 * 2. POST creation state: Managed by hook and Zustand store
 * 3. After create: Automatically notify user + refresh posts list
 * 4. Error handling: Done by hook, no try-catch needed here
 * 5. Zustand stores automatically update: Post added to store → Feed re-renders
 */
