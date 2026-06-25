import type { SupportMessage } from "@/lib/type";
import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface SupportMessagesResponse {
  status: boolean;
  message: string;
  data: SupportMessage[];
  pagination?: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export async function fetchSupportMessages(status?: string): Promise<SupportMessagesResponse> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.supportMessages, {
    method: "GET",
    query: status ? { status } : undefined,
  });

  return {
    status: Boolean(result?.status ?? true),
    message: result?.message ?? "Support messages fetched successfully",
    data: Array.isArray(result?.data) ? result.data : [],
    pagination: result?.pagination,
  };
}

export async function updateSupportMessageStatus(
  requestId: string,
  action: "approve" | "reject"
): Promise<any> {
  return apiRequest<any>(API_ENDPOINTS.backoffice.supportMessageById(requestId), {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}
