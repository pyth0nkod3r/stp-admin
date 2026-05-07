import type { User } from "@/lib/type";
import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface UsersResponse {
  status: boolean;
  message: string;
  data: User[];
}

export interface UsersSummary {
  totalUsers: number;
  verifiedUsers: number;
  pendingUsers: number;
  activeUsers: number;
}

export interface UsersSummaryResponse {
  status: boolean;
  message: string;
  data: UsersSummary;
}

export interface FetchUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email?: string;
  emailAddress?: string;
  cohort?: string;
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

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeUsersSummary(payload: any): UsersSummary {
  const summary = payload?.summary ?? payload ?? {};

  const totalUsers = asNumber(summary.totalUsers ?? summary.total);
  const verifiedUsers = asNumber(summary.verifiedUsers ?? summary.verified);
  const pendingUsers = asNumber(summary.pendingUsers ?? summary.pending);
  const activeUsers = asNumber(summary.activeUsers ?? summary.active);

  return {
    totalUsers,
    verifiedUsers,
    pendingUsers: pendingUsers || Math.max(totalUsers - verifiedUsers, 0),
    activeUsers,
  };
}

export async function fetchUsers(
  page = 1,
  perPage = 10
): Promise<UsersResponse> {
  return fetchUsersByParams({ page, perPage });
}

export async function fetchUsersByParams(
  params: FetchUsersParams = {}
): Promise<UsersResponse> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.users, {
    method: "GET",
    query: {
      page: params.page ?? 1,
      perPage: params.perPage ?? 10,
      search: params.search,
      isVerified:
        params.isVerified === undefined ? undefined : Number(params.isVerified),
      isActive: params.isActive === undefined ? undefined : Number(params.isActive),
    },
  });

  return {
    status: Boolean(result?.status ?? true),
    message: result?.message ?? "Users fetched successfully",
    data: Array.isArray(result?.data) ? result.data : [],
  };
}

export async function fetchUsersSummary(): Promise<UsersSummaryResponse> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.usersSummary, {
    method: "GET",
  });

  return {
    status: Boolean(result?.status ?? true),
    message: result?.message ?? "Users summary fetched successfully",
    data: normalizeUsersSummary(result?.data ?? result),
  };
}

export async function verifyUser(userId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.verifyUser(userId), {
    method: "PUT",
  });
}

export async function createUser(payload: CreateUserPayload): Promise<void> {
  const emailAddress = payload.emailAddress ?? payload.email ?? "";

  await apiRequest(API_ENDPOINTS.backoffice.onboardUser, {
    method: "POST",
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName: payload.lastName,
      emailAddress,
      email: emailAddress,
      cohort: payload.cohort ?? "",
    }),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.userById(userId), {
    method: "DELETE",
  });
}

export async function activateUser(userId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.activateUser(userId), {
    method: "PUT",
  });
}

export async function deactivateUser(userId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.deactivateUser(userId), {
    method: "PUT",
  });
}

export async function lockUser(userId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.lockUser(userId), {
    method: "PUT",
  });
}

export async function unlockUser(userId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.unlockUser(userId), {
    method: "PUT",
  });
}

export async function changeUserRole(userId: string, role: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.changeUserRole(userId), {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export async function fetchUserProfile(userId: string): Promise<UserProfileResponse> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.userById(userId), {
    method: "GET",
  });

  return {
    status: Boolean(result?.status ?? true),
    message: result?.message ?? "User profile fetched successfully",
    data: result?.data ?? result,
  };
}

export async function rejectUserVerification(userId: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.rejectUser(userId), {
    method: "PUT",
    body: JSON.stringify({ action: "reject" }),
  });
}
