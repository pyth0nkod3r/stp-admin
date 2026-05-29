import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface NewsfeedPost {
  id: string;
  title: string;
  content: string;
  category: string;
  publishedAt: string;
  views: number;
  status: "draft" | "published";
  coverImage?: string;
  authorImage?: string;
  coverImageUrl?: string;
  authorImageUrl?: string;
  postImages?: string[];
}

export interface CreateNewsfeedPayload {
  title: string;
  body: string;
  category: string;
  coverImage?: File;
  authorImage?: File;
  postImages?: File[];
}

export interface UpdateNewsfeedPayload extends CreateNewsfeedPayload {}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeNewsfeedPost(post: any): NewsfeedPost {
  return {
    id: post?.postId ?? post?.id ?? "",
    title: post?.title ?? "",
    content: post?.body ?? post?.content ?? "",
    category: post?.category ?? "General",
    publishedAt: post?.publishedAt ?? post?.createdAt ?? new Date().toISOString(),
    views: asNumber(post?.views ?? post?.readCount ?? post?.viewCount),
    status: String(post?.status).toLowerCase() === "draft" ? "draft" : "published",
    coverImage: post?.coverImage ?? post?.coverImageUrl ?? "",
    authorImage: post?.authorImage ?? post?.authorImageUrl ?? "",
    coverImageUrl: post?.coverImageUrl ?? post?.coverImage ?? "",
    authorImageUrl: post?.authorImageUrl ?? post?.authorImage ?? "",
    postImages: Array.isArray(post?.postImages) 
      ? post.postImages 
      : Array.isArray(post?.postImageUrls)
        ? post.postImageUrls
        : [],
  };
}

function buildNewsfeedFormData(payload: CreateNewsfeedPayload | UpdateNewsfeedPayload): FormData {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("body", payload.body);
  formData.append("category", payload.category);
  if (payload.coverImage) formData.append("coverImage", payload.coverImage);
  if (payload.authorImage) formData.append("authorImage", payload.authorImage);
  if (payload.postImages?.length) {
    payload.postImages.forEach((image) => formData.append("postImages[]", image));
  }
  return formData;
}

export async function getNewsfeed(): Promise<NewsfeedPost[]> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.moderationPosts, {
    method: "GET",
  });

  const rows = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result)
      ? result
      : [];

  const newsRows = rows.filter((post: any) => post?.title);
  return newsRows.map(normalizeNewsfeedPost);
}

export async function getNewsfeedPost(postId: string): Promise<NewsfeedPost> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.newsfeedById(postId), {
    method: "GET",
  });
  return normalizeNewsfeedPost(result?.data ?? result);
}

export async function createNewsfeed(payload: CreateNewsfeedPayload): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.newsfeed, {
    method: "POST",
    body: buildNewsfeedFormData(payload),
  });
}

export async function updateNewsfeed(
  postId: string,
  payload: UpdateNewsfeedPayload
): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.newsfeedById(postId), {
    method: "PUT",
    body: JSON.stringify({
      title: payload.title,
      body: payload.body,
      category: payload.category,
    }),
  });
}

export async function deleteNewsfeed(postId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.newsfeedById(postId), {
    method: "DELETE",
  });
}
