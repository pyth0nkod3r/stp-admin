import type { User } from "@/lib/type";
import { API_BASE_URL } from "./config";
import { clearAuthAndRedirect } from "./authUtils";

export interface UsersResponse {
  status: boolean;
  message: string;
  data: User[];
}

export async function fetchUsers(
  page: number = 1,
  perPage: number = 10
): Promise<UsersResponse> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users?page=${page}&perPage=${perPage}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch users");
  }

  const data: UsersResponse = await response.json();
  return data;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  emailAddress: string;
}

export async function verifyUser(userId: string): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users/${userId}/verify`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to verify user");
  }
}

export async function createUser(payload: CreateUserPayload): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/backoffice/users/onboard`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to create user");
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users/${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to delete user");
  }
}

export async function activateUser(userId: string): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users/${userId}/activate`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to activate user");
  }
}

export async function deactivateUser(userId: string): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users/${userId}/deactivate`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to deactivate user");
  }
}

export async function lockUser(userId: string): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users/${userId}/lock`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to lock user");
  }
}

export async function unlockUser(userId: string): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users/${userId}/unlock`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to unlock user");
  }
}

export async function changeUserRole(userId: string, role: string): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users/${userId}/role`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to change user role");
  }
}

export interface UserProfileResponse {
  status: boolean;
  message: string;
  data: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
    lastLogin: string | null;
    title: string | null;
    companyName: string | null;
    location: string | null;
    cohort: string | null;
    sector: string[];
    skills: string[];
    elevatorPitch: string | null;
    companyStage: string | null;
    businessModel: string | null;
    linkedin: string | null;
    needs: string[];
    offers: string[];
    goals: string | null;
    contactVisibility: string;
    language: string;
    theme: string;
    emailNotificationsEnabled: string | boolean;
    isDeactivated: string | boolean;
    isActive: boolean;
    isLocked: boolean;
    isVerified: boolean;
    isOnboarded: boolean;
    profileImagePath: string | null;
  };
}

export async function fetchUserProfile(userId: string): Promise<UserProfileResponse> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users/${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch user profile");
  }

  const data: UserProfileResponse = await response.json();
  return data;
}

export async function rejectUserVerification(userId: string): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_BASE_URL}/backoffice/users/${userId}/approve`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "reject" }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to reject user");
  }
}

// Content Management APIs
export interface FeedPost {
  id: string;
  user: string;
  content: string;
  status: 'pending' | 'approved' | 'flagged' | 'rejected';
  time: string;
}

export async function getPendingPosts(): Promise<FeedPost[]> {
  // Mock implementation - instant response for better UX
  return [
    {
      id: '1',
      user: 'David K.',
      content: 'Just landed a role at Google! Thanks to the STP network for the prep...',
      status: 'pending',
      time: '1h ago',
    },
    {
      user: 'Linda M.',
      content: 'Anyone interested in a weekend hackathon for Fintech? Looking for partners.',
      status: 'flagged',
      time: '3h ago',
      id: '2',
    },
  ];
}

export async function approvePost(postId: string): Promise<void> {
  // Mock implementation
  console.log(`Mock: Approved post with ID: ${postId}`);
}

export async function rejectPost(postId: string): Promise<void> {
  // Mock implementation
  console.log(`Mock: Rejected post with ID: ${postId}`);
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  publishedAt: string;
  views: number;
  status: 'draft' | 'published';
}

export interface CreateNewsPayload {
  title: string;
  body: string;
  category: string;
  postImages?: File[];
}

export async function createNews(payload: CreateNewsPayload): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("body", payload.body);
  formData.append("category", payload.category);
  if (payload.postImages && payload.postImages.length > 0) {
    payload.postImages.forEach((image, index) => {
      formData.append("postImages", image);
    });
  }

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to create news");
  }
}

export interface UpdateNewsPayload {
  title: string;
  body: string;
  category: string;
  postImages?: File[];
}

export async function updateNews(postId: string, payload: UpdateNewsPayload): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("body", payload.body);
  formData.append("category", payload.category);
  if (payload.postImages && payload.postImages.length > 0) {
    payload.postImages.forEach((image) => {
      formData.append("postImages", image);
    });
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to update news");
  }
}

export async function deleteNews(postId: string): Promise<void> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to delete news");
  }
}

export async function getNews(): Promise<NewsItem[]> {
  // Mock implementation - instant response for better UX
  return [
    {
      id: '1',
      title: 'Annual Alumni Gala 2026',
      content: 'Join us for the annual alumni gala...',
      category: 'announcement',
      publishedAt: '2026-02-15',
      views: 1200,
      status: 'published',
    },
    {
      id: '2',
      title: 'New Resource: Career Transition Guide',
      content: 'We\'ve published a comprehensive guide...',
      category: 'achievement',
      publishedAt: '2026-01-28',
      views: 850,
      status: 'published',
    },
    {
      id: '3',
      title: 'Campus Development Update',
      content: 'Exciting updates on campus development...',
      category: 'press',
      publishedAt: '2026-01-12',
      views: 430,
      status: 'published',
    },
  ];
}

export async function approveEvent(eventId: string): Promise<void> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Mock: Approved event with ID: ${eventId}`);
}

export async function declineEvent(eventId: string): Promise<void> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Mock: Declined event with ID: ${eventId}`);
}

export interface Resource {
  id: string;
  name: string;
  category: string;
  visibility: string;
  downloads: string;
  status: 'active' | 'archived';
}

export async function getResources(): Promise<Resource[]> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: '1',
      name: 'Alumni_Business_Directory_2026.pdf',
      category: 'Business',
      visibility: 'Verified',
      downloads: '1,240',
      status: 'active',
    },
    {
      id: '2',
      name: 'VC_Pitch_Deck_Master_Template.pptx',
      category: 'Investment',
      visibility: 'Verified',
      downloads: '458',
      status: 'active',
    },
    {
      id: '3',
      name: 'Code_of_Conduct_v2.docx',
      category: 'Compliance',
      visibility: 'All',
      downloads: '2.1k',
      status: 'active',
    },
    {
      id: '4',
      name: 'Grant_Proposal_Structure.pdf',
      category: 'Funding',
      visibility: 'Verified',
      downloads: '112',
      status: 'active',
    },
  ];
}

export async function archiveResource(resourceId: string): Promise<void> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Mock: Archived resource with ID: ${resourceId}`);
}

export async function deleteResource(resourceId: string): Promise<void> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Mock: Deleted resource with ID: ${resourceId}`);
}
