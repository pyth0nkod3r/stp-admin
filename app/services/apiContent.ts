import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface FeedPost {
  id: string;
  user: string;
  content: string;
  status: "pending" | "approved" | "flagged" | "rejected";
  time: string;
}

export interface Resource {
  id: string;
  name: string;
  description?: string;
  category: string;
  filePath?: string;
  createdAt?: string;
  uploaderFirstName?: string | null;
  uploaderLastName?: string | null;
  uploaderEmail?: string | null;
  visibility: string;
  downloads: string;
  status: "active" | "archived";
}

type ModerationAction = "approve" | "reject";

function normalizePostStatus(status: unknown): FeedPost["status"] {
  const value = String(status ?? "").toUpperCase();
  if (value.includes("FLAG")) return "flagged";
  if (value.includes("REJECT")) return "rejected";
  if (value.includes("APPROVE")) return "approved";
  return "pending";
}

function formatTime(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function normalizePost(post: any): FeedPost {
  const firstName = post?.firstName ?? post?.author?.firstName ?? "";
  const lastName = post?.lastName ?? post?.author?.lastName ?? "";
  const displayName =
    `${firstName} ${lastName}`.trim() ||
    post?.authorName ||
    post?.authorEmail ||
    post?.user ||
    "Unknown Author";

  return {
    id: post?.postId ?? post?.id ?? "",
    user: displayName,
    content: post?.body ?? post?.content ?? "",
    status: normalizePostStatus(post?.status),
    time: formatTime(post?.createdAt ?? post?.time),
  };
}

function normalizeResource(resource: any): Resource {
  return {
    id: resource?.resourceId ?? resource?.id ?? "",
    name: resource?.title ?? resource?.name ?? "Untitled Resource",
    description: resource?.description ?? "",
    category: resource?.category ?? "General",
    filePath: resource?.resourceFilePath ?? resource?.filePath ?? "",
    createdAt: resource?.createdAt ?? "",
    uploaderFirstName: resource?.firstName ?? null,
    uploaderLastName: resource?.lastName ?? null,
    uploaderEmail: resource?.email ?? null,
    visibility: resource?.visibility || (resource?.email ? "Verified" : "All"),
    downloads: String(resource?.downloads ?? 0),
    status: String(resource?.status).toLowerCase() === "archived" ? "archived" : "active",
  };
}

export async function getPendingPosts(
  page = 1,
  limit = 20
): Promise<FeedPost[]> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.moderationPosts, {
    method: "GET",
    query: { page, limit },
  });

  const rows = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result)
      ? result
      : [];

  return rows
    .map(normalizePost)
    .filter((post: FeedPost) => post.status === "pending" || post.status === "flagged");
}

async function moderatePost(postId: string, action: ModerationAction): Promise<void> {
  await apiRequest(`${API_ENDPOINTS.backoffice.moderationPosts}/${postId}/approve`, {
    method: "PUT",
    body: JSON.stringify({ action }),
  });
}

export async function approvePost(postId: string): Promise<void> {
  return moderatePost(postId, "approve");
}

export async function rejectPost(postId: string): Promise<void> {
  return moderatePost(postId, "reject");
}

export async function getResources(opts: {
  page?: number;
  limit?: number;
  sortBy?: string;
} = {}): Promise<Resource[]> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.moderationResources, {
    method: "GET",
    query: {
      page: opts.page ?? 1,
      limit: opts.limit ?? 20,
      sortBy: opts.sortBy ?? "newest",
    },
  });

  const rows = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result)
      ? result
      : [];

  return rows.map(normalizeResource);
}

export async function archiveResource(resourceId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.archiveResource(resourceId), {
    method: "PUT",
  });
}

export async function deleteResource(resourceId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.moderationResourceById(resourceId), {
    method: "DELETE",
  });
}
