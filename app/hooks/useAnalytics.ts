import { useQuery } from "@tanstack/react-query";
import { fetchPlatformAnalytics } from "@/services/apiAnalytics";
import type { AnalyticsFilters } from "@/services/apiAnalytics";

export function useAnalytics(filters: AnalyticsFilters) {
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("stp_token");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["platform-analytics", filters],
    queryFn: () => fetchPlatformAnalytics(filters),
    enabled: hasToken,
    staleTime: 30 * 1000, // 30 seconds caching
  });

  return {
    analytics: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
