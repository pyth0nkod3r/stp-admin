import { fetchEventById } from "@/services/apiEvents";
import { useQuery } from "@tanstack/react-query";

export function useEventDetails(eventId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventById(eventId!),
    enabled: !!eventId,
  });

  return {
    event: data?.data ?? null,
    isLoading,
    error,
  };
}
