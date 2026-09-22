import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface DealRoom {
  roomId: string;
  roomName: string;
  roomDescription: string;
  isActive: string;
  status?: string;
  isLocked?: boolean;
  createdAt: string;
  createdBy?: string;
  firstName: string;
  lastName: string;
  createdByEmail: string;
  memberCount: number;
  documentUrl: string | null;
  members?: DealRoomMember[];
  hasSignedNda?: boolean;
}

export type DealRoomModerationAction = "approve" | "reject";

export interface ModerateDealRoomPayload {
  action: DealRoomModerationAction;
  reason?: string;
}

export interface DealRoomsResponse {
  status: boolean;
  message: string;
  data: DealRoom[];
}

export const apiDealRooms = {
  async fetchAllDealRooms(): Promise<DealRoom[]> {
    const result = await apiRequest<DealRoomsResponse>(API_ENDPOINTS.dealrooms.list, {
      method: "GET",
    });
    const rooms = result.data ?? [];
    if (!rooms.length) return [];

    // For each room, fetch individual detail from /dealrooms/:roomId to resolve true member count
    const enriched = await Promise.all(
      rooms.map(async (room) => {
        try {
          const detail = await apiDealRooms.fetchDealRoom(room.roomId);
          if (detail) {
            const count = Array.isArray(detail.members)
              ? detail.members.length
              : typeof detail.memberCount === "number"
              ? detail.memberCount
              : room.memberCount;
            return {
              ...room,
              ...detail,
              memberCount: count,
            };
          }
        } catch {
          // Fallback to room summary if detail fetch fails
        }
        return room;
      })
    );
    return enriched;
  },

  async fetchPendingDealRooms(): Promise<DealRoom[]> {
    const result = await apiRequest<DealRoomsResponse>(
      API_ENDPOINTS.backoffice.pendingDealRooms,
      {
        method: "GET",
      }
    );
    const rooms = result.data ?? [];
    if (!rooms.length) return [];

    const enriched = await Promise.all(
      rooms.map(async (room) => {
        try {
          const detail = await apiDealRooms.fetchDealRoom(room.roomId);
          if (detail) {
            const count = Array.isArray(detail.members)
              ? detail.members.length
              : typeof detail.memberCount === "number"
              ? detail.memberCount
              : room.memberCount;
            return {
              ...room,
              ...detail,
              memberCount: count,
            };
          }
        } catch {
          // Fallback to room summary
        }
        return room;
      })
    );
    return enriched;
  },

  async fetchDealRoom(roomId: string): Promise<DealRoom> {
    const result = await apiRequest<{ status: boolean; data: any }>(
      API_ENDPOINTS.dealrooms.byId(roomId),
      {
        method: "GET",
      }
    );
    const room = result.data;
    if (room && Array.isArray(room.members)) {
      room.memberCount = room.members.length;
    }
    return room;
  },

  async createDealRoom(roomData: {
    roomName: string;
    roomDescription: string;
    members?: string[];
    document: File;
    images?: File[];
  }): Promise<DealRoom> {
    const formData = new FormData();
    formData.append("roomName", roomData.roomName);
    formData.append("roomDescription", roomData.roomDescription);

    if (roomData.members?.length) {
      roomData.members.forEach((memberId, index) => {
        formData.append(`members[${index}]`, memberId);
      });
    }

    formData.append("document", roomData.document);

    if (roomData.images?.length) {
      roomData.images.forEach((image) => formData.append("images", image));
    }

    const result = await apiRequest<{ status: boolean; data: DealRoom }>(
      API_ENDPOINTS.dealrooms.list,
      {
        method: "POST",
        body: formData,
      }
    );

    return result.data;
  },

  async updateDealRoom(
    roomId: string,
    updateData: Partial<{ roomName: string; roomDescription: string }>
  ): Promise<DealRoom> {
    const result = await apiRequest<{ status: boolean; data: DealRoom }>(
      API_ENDPOINTS.dealrooms.byId(roomId),
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      }
    );
    return result.data;
  },

  async deleteDealRoom(roomId: string): Promise<void> {
    await apiRequest(API_ENDPOINTS.dealrooms.byId(roomId), {
      method: "DELETE",
    });
  },

  async addMembersToRoom(roomId: string, members: string[]): Promise<void> {
    await apiRequest(API_ENDPOINTS.dealrooms.members(roomId), {
      method: "POST",
      body: JSON.stringify({ members }),
    });
  },

  async removeMemberFromRoom(roomId: string, userId: string): Promise<void> {
    await apiRequest(API_ENDPOINTS.dealrooms.memberById(roomId, userId), {
      method: "DELETE",
    });
  },

  async moderateDealRoom(
    roomId: string,
    payload: ModerateDealRoomPayload
  ): Promise<void> {
    await apiRequest(API_ENDPOINTS.backoffice.approveDealRoom(roomId), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async approveDealRoom(roomId: string): Promise<void> {
    await this.moderateDealRoom(roomId, { action: "approve" });
  },

  async rejectDealRoom(roomId: string, reason?: string): Promise<void> {
    await this.moderateDealRoom(roomId, { action: "reject", reason });
  },

  async fetchDealRoomLogs(): Promise<{ status: boolean; data: any[] }> {
    const result = await apiRequest<any>(API_ENDPOINTS.backoffice.dealRoomLogs, {
      method: "GET",
    });
    return {
      status: Boolean(result?.status ?? true),
      data: Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [],
    };
  },

  async fetchDealRoomAuditLog(roomId: string): Promise<{ status: boolean; data: any[] }> {
    const result = await apiRequest<any>(API_ENDPOINTS.backoffice.dealRoomAuditLog(roomId), {
      method: "GET",
    });
    return {
      status: Boolean(result?.status ?? true),
      data: Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [],
    };
  },

  async lockDealRoom(roomId: string, reason?: string): Promise<void> {
    const body = reason ? JSON.stringify({ reason }) : JSON.stringify({});
    await apiRequest(API_ENDPOINTS.backoffice.lockDealRoom(roomId), {
      method: "PATCH",
      body,
    });
  },

  async fetchDealRoomMembers(roomId: string): Promise<DealRoomMember[]> {
    try {
      const result = await apiRequest<DealRoomMembersResponse>(
        API_ENDPOINTS.backoffice.dealRoomMembers(roomId),
        {
          method: "GET",
        }
      );
      return Array.isArray(result?.data) ? result.data : [];
    } catch (err: any) {
      const serverMessage = err?.message || "Failed to fetch deal room members";
      throw new Error(`Server Error (${serverMessage})`);
    }
  },
};

export interface DealRoomMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  title?: string;
  companyName?: string;
  joinedAt?: string;
}

export interface DealRoomMembersResponse {
  status: boolean;
  data: DealRoomMember[];
  total: number;
}
