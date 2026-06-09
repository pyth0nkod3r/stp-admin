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

export interface GroupDetail extends GroupSummary {
  status: "ACTIVE" | "PENDING_APPROVAL" | "LOCKED";
  pendingReports?: number;
}

export interface GroupMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt?: string;
}

export interface GroupReport {
  reportId: string;
  groupId: string;
  groupName: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
}

export async function fetchGroups(
  status: "ALL" | "ACTIVE" | "LOCKED" = "ALL",
  page = 1,
  limit = 20
): Promise<{ status: boolean; message: string; data: GroupDetail[] }> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.groups, {
    method: "GET",
    query: { status, page, limit },
  });

  const rows = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];

  return {
    status: Boolean(result?.status ?? true),
    message: result?.message ?? "Groups fetched successfully",
    data: rows.map((group: any) => ({
      ...normalizeGroup(group),
      status: group?.status ?? (group?.isLocked ? "LOCKED" : "ACTIVE"),
      pendingReports: Number(group?.pendingReports ?? 0),
    })),
  };
}

export async function fetchGroupById(groupId: string): Promise<{ status: boolean; data: GroupDetail }> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.groupById(groupId), {
    method: "GET",
  });
  const data = result?.data ?? result;
  return {
    status: Boolean(result?.status ?? true),
    data: {
      ...normalizeGroup(data),
      status: data?.status ?? (data?.isLocked ? "LOCKED" : "ACTIVE"),
      pendingReports: Number(data?.pendingReports ?? 0),
    },
  };
}

export async function fetchGroupMembers(
  groupId: string,
  page = 1,
  limit = 20
): Promise<{ status: boolean; data: GroupMember[] }> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.groupMembers(groupId), {
    method: "GET",
    query: { page, limit },
  });

  const rows = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];

  return {
    status: Boolean(result?.status ?? true),
    data: rows.map((member: any) => ({
      userId: member?.userId ?? member?.id ?? "",
      firstName: member?.firstName ?? "",
      lastName: member?.lastName ?? "",
      email: member?.email ?? member?.emailAddress ?? "",
      joinedAt: member?.joinedAt ?? "",
    })),
  };
}

export async function fetchGroupReports(): Promise<{ status: boolean; data: GroupReport[] }> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.groupReports, {
    method: "GET",
  });

  const rows = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];

  return {
    status: Boolean(result?.status ?? true),
    data: rows.map((report: any) => ({
      reportId: report?.reportId ?? report?.id ?? "",
      groupId: report?.groupId ?? "",
      groupName: report?.groupName ?? "Reported Group",
      reason: report?.reason ?? "",
      reportedBy: report?.reportedBy ?? "Anonymous",
      createdAt: report?.createdAt ?? "",
    })),
  };
}

export async function lockGroup(groupId: string, reason?: string): Promise<void> {
  const body = reason ? JSON.stringify({ reason }) : JSON.stringify({});
  await apiRequest(API_ENDPOINTS.backoffice.lockGroup(groupId), {
    method: "PATCH",
    body,
  });
}
