const DASHBOARD_BASE_URL = "/stp//api/backoffice/dashboard/summary";

export interface DashboardSummary {
  totalUsers: number;
  totaldealRooms: number;
}

export interface DashboardResponse {
  status: boolean;
  message: string;
  data: DashboardSummary;
}

export async function fetchDashboardSummary(): Promise<DashboardResponse> {
  const token = localStorage.getItem("commuta_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(DASHBOARD_BASE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    redirect: "follow",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch dashboard summary");
  }

  return response.json();
}
