import { API_BASE_URL } from "./config";
import { clearAuthAndRedirect } from "./authUtils";

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  pendingGroups: number;
  pendingEvents: number;
  totalGroups: number;
  totalEvents: number;
}

export interface DashboardResponse {
  status: boolean;
  message: string;
  data: DashboardSummary;
}

export async function fetchDashboardSummary(): Promise<DashboardResponse> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/backoffice/dashboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    redirect: "follow",
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch dashboard summary");
  }

  return response.json();
}
