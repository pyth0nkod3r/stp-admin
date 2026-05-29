import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface SecurityLog {
  eventType: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "PASSWORD_RESET_REQUEST" | "ACCOUNT_LOCKED" | "ACCOUNT_DELETED";
  email: string;
  ipAddress: string;
  createdAt: string;
}

export interface BruteForceAttempt {
  ipAddress: string;
  attempts: number;
}

export interface SecurityLogsResponse {
  data: SecurityLog[];
  bruteForce: BruteForceAttempt[];
}

export async function fetchSecurityLogs(
  type?: string,
  page = 1,
  limit = 50
): Promise<SecurityLogsResponse> {
  const query: Record<string, any> = {
    page,
    limit,
  };
  if (type && type !== "ALL") {
    query.type = type;
  }

  const result = await apiRequest<any>(API_ENDPOINTS.security.logs, {
    method: "GET",
    query,
  });

  return {
    data: Array.isArray(result?.data) ? result.data : [],
    bruteForce: Array.isArray(result?.bruteForce) ? result.bruteForce : [],
  };
}
