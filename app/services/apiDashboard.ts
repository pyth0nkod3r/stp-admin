import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface DashboardSummary {
  totalUsers: number;
  verifiedUsers: number;
  pendingUsers: number;
  activeUsers: number;
  pendingGroups: number;
  pendingEvents: number;
  totalGroups: number;
  totalEvents: number;
  alumniConnections: number;
}

export interface DashboardResponse {
  status: boolean;
  message: string;
  data: DashboardSummary;
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDashboardSummary(payload: any): DashboardSummary {
  const summary = payload?.summary ?? payload ?? {};

  return {
    totalUsers: asNumber(summary.totalUsers ?? summary.total),
    verifiedUsers: asNumber(summary.verifiedUsers ?? summary.verified),
    pendingUsers: asNumber(summary.pendingUsers ?? summary.pending),
    activeUsers: asNumber(summary.activeUsers ?? summary.active),
    pendingGroups: asNumber(payload?.pendingGroups ?? summary.pendingGroups),
    pendingEvents: asNumber(payload?.pendingEvents ?? summary.pendingEvents),
    totalGroups: asNumber(summary.totalGroups ?? payload?.totalGroups),
    totalEvents: asNumber(summary.totalEvents ?? payload?.totalEvents),
    alumniConnections: asNumber(
      payload?.alumniConnections ?? summary.alumniConnections
    ),
  };
}

export async function fetchDashboardSummary(): Promise<DashboardResponse> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.dashboard, {
    method: "GET",
  });

  return {
    status: Boolean(result?.status ?? true),
    message: result?.message ?? "Dashboard summary fetched successfully",
    data: normalizeDashboardSummary(result?.data ?? result),
  };
}
