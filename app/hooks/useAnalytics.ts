import { useQuery } from "@tanstack/react-query";
import { fetchPlatformAnalytics, fetchAnalyticsFilters } from "@/services/apiAnalytics";
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

export function useAnalyticsFilters() {
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("stp_token");

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics-filters"],
    queryFn: fetchAnalyticsFilters,
    enabled: hasToken,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours caching
  });

  return {
    filtersData: data?.data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
