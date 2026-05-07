import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEvent } from "@/services/apiEvents";

export interface CreateEventPayload {
  name: string;
  startTime: string;
  endTime: string;
  address: string;
  type: string;
  timeZone: string;
  description: string;
  externalLink: string;
  venue: string;
  coverImage?: File;
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: () => {
      toast.success("Event created successfully");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create event");
    },
  });
}
