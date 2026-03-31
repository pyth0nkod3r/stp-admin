import { fetchEvents, fetchPendingEvents } from "@/services/apiEvents";
import { useQuery } from "@tanstack/react-query";

export function useEvents() {
  const eventsQuery = useQuery({
    queryKey: ["events", "approved"],
    queryFn: fetchEvents,
  });

  const pendingEventsQuery = useQuery({
    queryKey: ["events", "pending"],
    queryFn: fetchPendingEvents,
  });

  const allEvents = [
    ...(eventsQuery.data?.data?.map(e => ({ ...e, eventStatus: 'approved' as const })) ?? []),
    ...(pendingEventsQuery.data?.data?.map(e => ({ ...e, eventStatus: 'pending' as const })) ?? [])
  ];

  // Sort them so the most upcoming events show first
  allEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return {
    events: allEvents,
    approvedEvents: eventsQuery.data?.data ?? [],
    pendingEvents: pendingEventsQuery.data?.data ?? [],
    isLoading: eventsQuery.isLoading || pendingEventsQuery.isLoading,
    error: eventsQuery.error || pendingEventsQuery.error,
  };
}
