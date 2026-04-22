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
    payload.postImages.forEach((image) => formData.append("postImages", image));
  }
  return formData;
}

export async function getNewsfeed(): Promise<NewsfeedPost[]> {
  const result = await apiRequest<any>(API_ENDPOINTS.newsfeed.list, {
    method: "GET",
  });

  const rows = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result)
      ? result
      : [];

  return rows.map(normalizeNewsfeedPost);
}

export async function getNewsfeedPost(postId: string): Promise<NewsfeedPost> {
  const result = await apiRequest<any>(API_ENDPOINTS.newsfeed.byId(postId), {
    method: "GET",
  });
  return normalizeNewsfeedPost(result?.data ?? result);
}

export async function createNewsfeed(payload: CreateNewsfeedPayload): Promise<void> {
  await apiRequest(API_ENDPOINTS.newsfeed.list, {
    method: "POST",
    body: buildNewsfeedFormData(payload),
  });
}

export async function updateNewsfeed(
  postId: string,
  payload: UpdateNewsfeedPayload
): Promise<void> {
  await apiRequest(API_ENDPOINTS.newsfeed.byId(postId), {
    method: "PUT",
    body: buildNewsfeedFormData(payload),
  });
}

export async function deleteNewsfeed(postId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.newsfeed.byId(postId), {
    method: "DELETE",
  });
}
