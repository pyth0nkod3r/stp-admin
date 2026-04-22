import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface GroupSummary {
  groupId: string;
  name: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  memberCount?: number;
}

export interface GroupsPendingResponse {
  status: boolean;
  message: string;
  data: GroupSummary[];
}

export interface ApproveGroupPayload {
  action: "approve" | "reject";
  reason?: string;
}

function asNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeGroup(group: any): GroupSummary {
  const createdByName = `${group?.firstName ?? ""} ${group?.lastName ?? ""}`.trim();
  const createdByFallback =
    createdByName || group?.createdByEmail || group?.email || "Unknown";

  return {
    groupId: group?.groupId ?? group?.id ?? "",
    name: group?.name ?? group?.groupName ?? group?.title ?? "Untitled Group",
    description: group?.description ?? "",
    createdBy: group?.createdBy ?? createdByFallback,
    createdAt: group?.createdAt ?? group?.created_at ?? "",
    memberCount: asNumber(group?.memberCount ?? group?.membersCount ?? group?.members),
  };
}

export async function getPendingGroups(): Promise<GroupsPendingResponse> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.groupsPending, {
    method: "GET",
  });

  const rows = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result)
      ? result
      : [];

  return {
    status: Boolean(result?.status ?? true),
    message: result?.message ?? "Pending groups fetched successfully",
    data: rows
      .map(normalizeGroup)
      .filter((group: GroupSummary) => Boolean(group.groupId)),
  };
}

export async function moderateGroup(
  groupId: string,
  payload: ApproveGroupPayload
): Promise<void> {
  await apiRequest(API_ENDPOINTS.backoffice.approveGroup(groupId), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function approveGroup(groupId: string): Promise<void> {
  return moderateGroup(groupId, { action: "approve" });
}

export async function rejectGroup(groupId: string, reason: string): Promise<void> {
  return moderateGroup(groupId, { action: "reject", reason });
}
