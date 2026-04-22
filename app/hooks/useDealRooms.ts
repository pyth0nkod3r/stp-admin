import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDealRooms, type DealRoom } from "@/services/apiDealRooms";

export interface RoomMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const useDealRooms = () => {
  const queryClient = useQueryClient();

  const {
    data: dealRooms = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dealRooms"],
    queryFn: apiDealRooms.fetchAllDealRooms,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      roomName: string;
      roomDescription: string;
      members?: string[];
      document: File;
      images?: File[];
    }) => apiDealRooms.createDealRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      toast.success("Opportunity created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create opportunity: ${error.message}`);
    },
  });

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

export type { DealRoom };
