import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface FeedPost {
  id: string;
  postId?: string;
  user: string;
  userEmail?: string;
  userAvatar?: string;
  title?: string;
  content: string;
  status: "pending" | "approved" | "flagged" | "reported" | "hidden" | "active" | "rejected";
  isHidden?: boolean;
  isReported?: boolean;
  reportReason?: string;
  reportedBy?: string;
  reportedAt?: string;
  time: string;
  createdAt?: string;
  images?: string[];
}

export interface ReportedPost extends FeedPost {
  reportReason: string;
  reportedBy?: string;
  reportedAt?: string;
  isHidden: boolean;
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
  resourceFileUrl?: string;
}

export interface UploadResourcePayload {
  title: string;
  description?: string;
  category: string;
  visibility?: string;
  file: File;
}

type ModerationAction = "approve" | "reject" | "hide" | "unhide" | "delete";

// Local storage key to maintain admin moderation actions when backend endpoints are mock/in-development
const LOCAL_MODERATED_POSTS_KEY = "stp_moderated_posts_state";

function getLocalModeratedState(): Record<string, { isHidden?: boolean; isDeleted?: boolean; status?: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_MODERATED_POSTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalModeratedState(postId: string, state: { isHidden?: boolean; isDeleted?: boolean; status?: string }) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalModeratedState();
    current[postId] = { ...current[postId], ...state };
    localStorage.setItem(LOCAL_MODERATED_POSTS_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to save local moderation state:", err);
  }
}

function normalizePostStatus(status: unknown, isHidden?: boolean): FeedPost["status"] {
  if (isHidden) return "hidden";
  const value = String(status ?? "").toUpperCase();
  if (value.includes("HIDE") || value.includes("HIDDEN")) return "hidden";
  if (value.includes("REPORT")) return "reported";
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

function normalizePost(post: any): ReportedPost {
  const localMods = getLocalModeratedState();
  const postId = post?.postId ?? post?.id ?? "";
  const localState = localMods[postId] || {};

  const firstName = post?.firstName ?? post?.author?.firstName ?? "";
  const lastName = post?.lastName ?? post?.author?.lastName ?? "";
  const displayName =
    `${firstName} ${lastName}`.trim() ||
    post?.authorName ||
    post?.authorEmail ||
    post?.user ||
    "Unknown Author";

  const isHidden = localState.isHidden !== undefined 
    ? localState.isHidden 
    : Boolean(post?.isHidden || post?.is_hidden || post?.hidden || String(post?.status).toLowerCase() === "hidden");
  const reportReason = post?.reportReason ?? post?.reason ?? post?.reportedReason ?? post?.flagReason ?? "Reported by community member";
  const isReported = Boolean(post?.isReported || post?.is_reported || post?.reportCount > 0 || post?.reportReason || post?.status === "REPORTED" || post?.status === "FLAGGED");

  return {
    id: postId,
    postId: postId,
    user: displayName,
    userEmail: post?.email ?? post?.authorEmail ?? post?.author?.email ?? "",
    userAvatar: post?.avatarUrl ?? post?.profileImagePath ?? post?.author?.avatarUrl ?? "",
    title: post?.title ?? "",
    content: post?.body ?? post?.content ?? "",
    status: localState.status ? (localState.status as any) : normalizePostStatus(post?.status, isHidden),
    isHidden,
    isReported,
    reportReason,
    reportedBy: post?.reportedBy ?? post?.reported_by ?? "Community Member",
    reportedAt: post?.reportedAt ?? post?.reported_at ?? post?.createdAt,
    time: formatTime(post?.createdAt ?? post?.time),
    createdAt: post?.createdAt ?? "",
    images: Array.isArray(post?.images) ? post.images : post?.imageUrl ? [post.imageUrl] : [],
  };
}

function normalizeResource(resource: any): Resource {
  return {
    id: resource?.resourceId ?? resource?.id ?? "",
    name: resource?.title ?? resource?.name ?? "Untitled Resource",
    description: resource?.description ?? "",
    category: resource?.category ?? "General",
    filePath:
      resource?.resourceFileUrl ??
      resource?.resourceFilePath ??
      resource?.fileUrl ??
      resource?.filePath ??
      "",
    createdAt: resource?.createdAt ?? "",
    uploaderFirstName: resource?.firstName ?? null,
    uploaderLastName: resource?.lastName ?? null,
    uploaderEmail: resource?.email ?? null,
    visibility: resource?.visibility || (resource?.email ? "Verified" : "All"),
    downloads: String(resource?.downloads ?? 0),
    status: String(resource?.status).toLowerCase() === "archived" ? "archived" : "active",
    resourceFileUrl:
      resource?.resourceFileUrl ??
      resource?.resourceFilePath ??
      resource?.fileUrl ??
      resource?.filePath ??
      "",
  };
}

export async function fetchReportedPosts(
  page = 1,
  limit = 20
): Promise<ReportedPost[]> {
  const localMods = getLocalModeratedState();

  try {
    const result = await apiRequest<any>(API_ENDPOINTS.backoffice.reportedPosts, {
      method: "GET",
      query: { page, limit },
    });

    const rows = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    const normalized = rows.map(normalizePost);
    return normalized.filter((p: ReportedPost) => !localMods[p.id]?.isDeleted);
  } catch (error: any) {
    const serverMessage = error?.message || "Failed to fetch reported posts from backend";
    console.error("Backend reported posts error:", serverMessage);
    throw new Error(`Server Error (${serverMessage})`);
  }
}

export async function hideReportedPost(postId: string): Promise<void> {
  setLocalModeratedState(postId, { isHidden: true, status: "hidden" });
  try {
    await apiRequest(API_ENDPOINTS.backoffice.hidePost(postId), {
      method: "PATCH",
      body: JSON.stringify({ isHidden: true, status: "hidden" }),
    });
  } catch (err: any) {
    const msg = err?.message || "Failed to hide post on server";
    console.error("hideReportedPost error:", msg);
    throw new Error(msg);
  }
}

export async function unhideReportedPost(postId: string): Promise<void> {
  setLocalModeratedState(postId, { isHidden: false, status: "active" });
  try {
    await apiRequest(API_ENDPOINTS.backoffice.unhidePost(postId), {
      method: "PATCH",
      body: JSON.stringify({ isHidden: false, status: "active" }),
    });
  } catch (err: any) {
    const msg = err?.message || "Failed to unhide post on server";
    console.error("unhideReportedPost error:", msg);
    throw new Error(msg);
  }
}

export async function deleteReportedPost(postId: string): Promise<void> {
  setLocalModeratedState(postId, { isDeleted: true });
  try {
    await apiRequest(API_ENDPOINTS.backoffice.deletePost(postId), {
      method: "DELETE",
    });
  } catch (err: any) {
    const msg = err?.message || "Failed to delete post on server";
    console.error("deleteReportedPost error:", msg);
    throw new Error(msg);
  }
}

export async function getPendingPosts(
  page = 1,
  limit = 20
): Promise<FeedPost[]> {
  const localMods = getLocalModeratedState();

  try {
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
      .filter((post: ReportedPost) => !localMods[post.id]?.isDeleted && (post.status === "pending" || post.status === "flagged" || post.status === "reported"));
  } catch (error: any) {
    const serverMessage = error?.message || "Failed to fetch pending moderation posts";
    console.error("Backend pending posts error:", serverMessage);
    throw new Error(`Server Error (${serverMessage})`);
  }
}

async function moderatePost(postId: string, action: ModerationAction): Promise<void> {
  if (action === "hide") return hideReportedPost(postId);
  if (action === "unhide") return unhideReportedPost(postId);
  if (action === "delete") return deleteReportedPost(postId);

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
  const result = await apiRequest<any>(API_ENDPOINTS.resources.list, {
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

export async function uploadResource(
  payload: UploadResourcePayload
): Promise<Resource> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("name", payload.title);
  formData.append("description", payload.description ?? "");
  formData.append("category", payload.category);
  if (payload.visibility) formData.append("visibility", payload.visibility);
  formData.append("resourceFile", payload.file);
  formData.append("file", payload.file);

  const result = await apiRequest<any>(API_ENDPOINTS.resources.list, {
    method: "POST",
    body: formData,
  });

  return normalizeResource(result?.data ?? result);
}

export async function downloadResource(resourceId: string): Promise<string> {
  const result = await apiRequest<any>(API_ENDPOINTS.resources.download(resourceId), {
    method: "POST",
  });

  const data = result?.data ?? result ?? {};
  return (
    data?.resourceFileUrl ??
    data?.resourceFilePath ??
    data?.fileUrl ??
    data?.filePath ??
    ""
  );
}

export async function archiveResource(resourceId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.archiveResource(resourceId), {
    method: "PUT",
  });
}

export async function deleteResource(resourceId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.resources.delete(resourceId), {
    method: "DELETE",
  });
}

export async function getPendingResources(
  page = 1,
  limit = 20
): Promise<Resource[]> {
  const result = await apiRequest<any>(API_ENDPOINTS.resources.pending, {
    method: "GET",
    query: { page, limit },
  });

  const rows = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
  return rows.map(normalizeResource);
}

export async function reviewResource(
  resourceId: string,
  action: "approve" | "reject"
): Promise<void> {
  await apiRequest(API_ENDPOINTS.resources.review(resourceId), {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

export async function fetchUserUploadedResources(
  search?: string,
  page = 1,
  limit = 20
): Promise<Resource[]> {
  const result = await apiRequest<any>(API_ENDPOINTS.resources.userUploaded, {
    method: "GET",
    query: { search, page, limit },
  });

  const rows = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
  return rows.map(normalizeResource);
}
