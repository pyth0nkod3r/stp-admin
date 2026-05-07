import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface BackofficeAdmin {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive?: boolean;
  isLocked?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
}

function normalizeAdmin(admin: any): BackofficeAdmin {
  return {
    userId: admin?.userId ?? admin?.id ?? "",
    firstName: admin?.firstName ?? "",
    lastName: admin?.lastName ?? "",
    email: admin?.email ?? admin?.emailAddress ?? "",
    role: admin?.role ?? "ADMIN",
    isActive: admin?.isActive,
    isLocked: admin?.isLocked,
    lastLogin: admin?.lastLogin ?? null,
    createdAt: admin?.createdAt ?? "",
  };
}

export async function fetchBackofficeAdmins(): Promise<BackofficeAdmin[]> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.admins, {
    method: "GET",
  });

  const rows = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result)
      ? result
      : [];

  return rows
    .map(normalizeAdmin)
    .filter((admin: BackofficeAdmin) => Boolean(admin.userId || admin.email));
}
