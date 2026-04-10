import { fetchEvents, fetchPendingEvents } from "@/services/apiEvents";
import { useEventsStore } from "@/stores/eventsStore";
import { useEffect, useState } from "react";

export function useEvents() {
  const events = useEventsStore((state) => state.events);
  const approvedEvents = useEventsStore((state) => state.approvedEvents);
  const pendingEvents = useEventsStore((state) => state.pendingEvents);
  const isLoading = useEventsStore((state) => state.isLoading);
  const error = useEventsStore((state) => state.error);
  const setApprovedEvents = useEventsStore((state) => state.setApprovedEvents);
  const setPendingEvents = useEventsStore((state) => state.setPendingEvents);
  const setEvents = useEventsStore((state) => state.setEvents);
  const setIsLoading = useEventsStore((state) => state.setIsLoading);
  const setError = useEventsStore((state) => state.setError);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("stp_token") : null;
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || hasInitialized) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [approvedRes, pendingRes] = await Promise.all([
          fetchEvents(),
          fetchPendingEvents(),
        ]);

        setApprovedEvents(approvedRes.data);
        setPendingEvents(pendingRes.data);

        const allEvents = [
          ...approvedRes.data,
          ...pendingRes.data,
        ];
        allEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        setEvents(allEvents);
      } catch (error: any) {
        setError(error?.message || "Failed to fetch events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setHasInitialized(true);
  }, [isAuthenticated, hasInitialized]);

  return {
    events,
    approvedEvents,
    pendingEvents,
    isLoading,
    error,
  };
}
