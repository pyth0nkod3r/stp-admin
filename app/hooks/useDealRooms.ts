import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiErrorHandler";
import { apiDealRooms } from "@/services/apiDealRooms";

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

export interface RoomMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

const API_BASE_URL = import.meta.env.DEV ? "/stp/api" : "https://app.gfa-tech.com/stp/api";

const fetchDealRoomsData = async (): Promise<DealRoom[]> => {
  const response = await apiFetch(`${API_BASE_URL}/dealrooms`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch deal rooms: ${response.statusText}`);
  }

  const data: { status: boolean; message: string; data: DealRoom[] } = await response.json();
  
  if (!data.status) {
    throw new Error(data.message || "Failed to fetch deal rooms");
  }

  return data.data || [];
};

const fetchRoomDetails = async (roomId: string): Promise<DealRoom> => {
  const response = await apiFetch(`${API_BASE_URL}/dealrooms/${roomId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch room details: ${response.statusText}`);
  }

  const data: { status: boolean; data: DealRoom } = await response.json();
  
  if (!data.status) {
    throw new Error("Failed to fetch room details");
  }

  return data.data;
};

export const useDealRooms = () => {
  const queryClient = useQueryClient();

  const {
    data: dealRooms = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dealRooms"],
    queryFn: fetchDealRoomsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { roomName: string; roomDescription: string }) =>
      apiDealRooms.createDealRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      toast.success("Opportunity created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create opportunity: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      roomId,
      updateData,
    }: {
      roomId: string;
      updateData: { roomName: string; roomDescription: string };
    }) => apiDealRooms.updateDealRoom(roomId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      toast.success("Opportunity updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update opportunity: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => apiDealRooms.deleteDealRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      toast.success("Opportunity deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete opportunity: ${error.message}`);
    },
  });

  // Add members mutation
  const addMembersMutation = useMutation({
    mutationFn: ({ roomId, members }: { roomId: string; members: string[] }) =>
      apiDealRooms.addMembersToRoom(roomId, members),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      toast.success("Members added successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add members: ${error.message}`);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) =>
      apiDealRooms.removeMemberFromRoom(roomId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      toast.success("Member removed successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove member: ${error.message}`);
    },
  });

  return {
    dealRooms,
    isLoading,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
    addMembersMutation,
    removeMemberMutation,
  };
};
