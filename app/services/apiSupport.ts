import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface SupportTicket {
  supportId?: string;
  id?: string;
  userId?: string;
  userEmail?: string;
  email?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "RESOLVED" | string;
  createdAt: string;
  updatedAt?: string;
}

export interface SupportTicketsResponse {
  status: boolean;
  message?: string;
  data: SupportTicket[];
  pagination?: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UnreadSupportCountResponse {
  status: boolean;
  data?: {
    unreadCount?: number;
    count?: number;
  } | number;
  count?: number;
}

export async function fetchSupportTickets(
  status?: string,
  page = 1,
  limit = 20
): Promise<SupportTicketsResponse> {
  try {
    const query: Record<string, string | number> = { page, limit };
    if (status && status !== "ALL") {
      query.status = status;
    }

    const result = await apiRequest<any>(API_ENDPOINTS.backoffice.supportTickets, {
      method: "GET",
      query,
    });

    const dataRows = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    return {
      status: Boolean(result?.status ?? true),
      message: result?.message || "Support tickets fetched successfully",
      data: dataRows.map((t: any) => ({
        supportId: t.supportId || t.id || "",
        id: t.supportId || t.id || "",
        userId: t.userId || "",
        userEmail: t.userEmail || t.email || "",
        userName: t.userName || (t.firstName ? `${t.firstName} ${t.lastName || ""}`.trim() : "Alumni User"),
        subject: t.subject || "No Subject",
        message: t.message || "",
        status: (t.status || "UNREAD").toUpperCase(),
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt,
      })),
      pagination: result?.pagination,
    };
  } catch (err: any) {
    const serverMessage = err?.message || "Failed to fetch support tickets from server";
    throw new Error(serverMessage);
  }
}

export async function fetchUnreadSupportCount(): Promise<number> {
  try {
    const result = await apiRequest<any>(API_ENDPOINTS.backoffice.supportUnreadCount, {
      method: "GET",
    });

    if (typeof result?.data === "number") return result.data;
    if (typeof result?.data?.unreadCount === "number") return result.data.unreadCount;
    if (typeof result?.data?.count === "number") return result.data.count;
    if (typeof result?.count === "number") return result.count;
    return 0;
  } catch (err: any) {
    console.error("fetchUnreadSupportCount error:", err?.message);
    return 0;
  }
}

export async function updateSupportTicketStatus(
  supportId: string,
  status: "RESOLVED" | "READ" | "UNREAD" = "RESOLVED"
): Promise<any> {
  try {
    const result = await apiRequest<any>(API_ENDPOINTS.backoffice.supportTicketById(supportId), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return result;
  } catch (err: any) {
    const serverMessage = err?.message || "Failed to update support ticket status";
    throw new Error(serverMessage);
  }
}
