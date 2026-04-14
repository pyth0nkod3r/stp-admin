import { API_BASE_URL } from "./config";

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
  /**
   * Get all deal rooms (BACKOFFICE gets all rooms)
   */
  async fetchAllDealRooms(): Promise<DealRoom[]> {
    const token = localStorage.getItem("stp_token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/dealrooms`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deal rooms: ${response.statusText}`);
    }

    const data: DealRoomsResponse = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || "Failed to fetch deal rooms");
    }

    return data.data || [];
  },

  /**
   * Get a specific deal room by ID
   */
  async fetchDealRoom(roomId: string): Promise<DealRoom> {
    const token = localStorage.getItem("stp_token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/dealrooms/${roomId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deal room: ${response.statusText}`);
    }

    const data: { status: boolean; data: DealRoom } = await response.json();
    
    if (!data.status) {
      throw new Error("Failed to fetch deal room");
    }

    return data.data;
  },

  /**
   * Create a new deal room (BACKOFFICE only)
   */
  async createDealRoom(roomData: {
    roomName: string;
    roomDescription: string;
    members?: string[];
    document: File;
    images?: File[];
  }): Promise<DealRoom> {
    const token = localStorage.getItem("stp_token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("roomName", roomData.roomName);
    formData.append("roomDescription", roomData.roomDescription);
    
    // Add members with proper array format (if provided)
    if (roomData.members && roomData.members.length > 0) {
      roomData.members.forEach((memberId, index) => {
        formData.append(`members[${index}]`, memberId);
      });
    }

    // Add document if provided
    if (roomData.document) {
      formData.append("document", roomData.document);
    }

    // Add images if provided
    if (roomData.images && roomData.images.length > 0) {
      roomData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }

    const response = await fetch(`${API_BASE_URL}/dealrooms`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create deal room: ${response.statusText}`);
    }

    const data: { status: boolean; data: DealRoom } = await response.json();
    
    if (!data.status) {
      throw new Error("Failed to create deal room");
    }

    return data.data;
  },

  /**
   * Update a deal room (BACKOFFICE only)
   */
  async updateDealRoom(
    roomId: string,
    updateData: Partial<{ roomName: string; roomDescription: string }>
  ): Promise<DealRoom> {
    const token = localStorage.getItem("stp_token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/dealrooms/${roomId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update deal room: ${response.statusText}`);
    }

    const data: { status: boolean; data: DealRoom } = await response.json();
    
    if (!data.status) {
      throw new Error("Failed to update deal room");
    }

    return data.data;
  },

  /**
   * Delete a deal room (BACKOFFICE only)
   */
  async deleteDealRoom(roomId: string): Promise<void> {
    const token = localStorage.getItem("stp_token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/dealrooms/${roomId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete deal room: ${response.statusText}`);
    }
  },

  /**
   * Add members to a deal room (BACKOFFICE only)
   */
  async addMembersToRoom(roomId: string, members: string[]): Promise<void> {
    const token = localStorage.getItem("stp_token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    members.forEach((memberId, index) => {
      formData.append(`members[${index}]`, memberId);
    });

    const response = await fetch(`${API_BASE_URL}/dealrooms/${roomId}/members`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to add members: ${response.statusText}`);
    }
  },

  /**
   * Remove a member from a deal room (BACKOFFICE only)
   */
  async removeMemberFromRoom(roomId: string, userId: string): Promise<void> {
    const token = localStorage.getItem("stp_token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/dealrooms/${roomId}/members/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to remove member: ${response.statusText}`);
    }
  },
};
