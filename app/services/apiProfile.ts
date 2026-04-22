import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImagePath?: string | null;
  title?: string | null;
  companyName?: string | null;
  location?: string | null;
  cohort?: string | null;
  language?: string;
  theme?: string;
  emailNotificationsEnabled?: boolean;
}

export interface UserPreferencesUpdatePayload {
  language?: string;
  theme?: string;
  emailNotificationsEnabled?: boolean;
  contactVisibility?: string;
}

export interface ProfileSetupPayload {
  firstName?: string;
  lastName?: string;
  title?: string;
  companyName?: string;
  location?: string;
  cohort?: string;
  elevatorPitch?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function getProfile(): Promise<UserProfile> {
  const result = await apiRequest<any>(API_ENDPOINTS.profile.get, {
    method: "GET",
  });
  return result?.data ?? result;
}

export async function setupProfile(payload: ProfileSetupPayload): Promise<void> {
  await apiRequest(API_ENDPOINTS.profile.setup, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProfile(payload: ProfileSetupPayload): Promise<void> {
  await apiRequest(API_ENDPOINTS.profile.update, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadProfileAvatar(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("avatar", file);

  await apiRequest(API_ENDPOINTS.profile.avatar, {
    method: "POST",
    body: formData,
  });
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiRequest(API_ENDPOINTS.profile.changePassword, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePreferences(
  payload: UserPreferencesUpdatePayload
): Promise<void> {
  await apiRequest(API_ENDPOINTS.profile.preferences, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
