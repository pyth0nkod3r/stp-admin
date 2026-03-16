import { fetchEvents } from "@/services/apiEvents";
import { useQuery } from "@tanstack/react-query";

export function useEvents() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  return {
    events: data?.data ?? [],
    isLoading,
    error,
  };
}
