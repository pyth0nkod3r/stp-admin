import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEventsStore } from "@/stores/eventsStore";
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
  const store = useEventsStore();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: async () => {
      toast.success("Event created successfully");
      // Refetch all events to get the new event
      store.setIsLoading(true);
      try {
        const { fetchEvents, fetchPendingEvents } = await import("@/services/apiEvents");
        const [approvedRes, pendingRes] = await Promise.all([
          fetchEvents(),
          fetchPendingEvents(),
        ]);
        store.setApprovedEvents(approvedRes.data);
        store.setPendingEvents(pendingRes.data);
        const allEvents = [...approvedRes.data, ...pendingRes.data];
        allEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        store.setEvents(allEvents);
      } catch (error: any) {
        toast.error("Failed to refresh events list");
      } finally {
        store.setIsLoading(false);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create event");
    },
  });
}
