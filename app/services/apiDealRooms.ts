import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface DealRoom {
  roomId: string;
  roomName: string;
  roomDescription: string;
  isActive: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  createdByEmail: string;
  memberCount: number;
  documentUrl: string;
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
    return result.data ?? [];
  },

  async fetchDealRoom(roomId: string): Promise<DealRoom> {
    const result = await apiRequest<{ status: boolean; data: DealRoom }>(
      API_ENDPOINTS.dealrooms.byId(roomId),
      {
        method: "GET",
      }
    );
    return result.data;
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
};
