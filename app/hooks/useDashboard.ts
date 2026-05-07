import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "@/services/apiDashboard";

export function useDashboard() {
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("stp_token");

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    enabled: hasToken,
    staleTime: 60 * 1000,
  });

  return {
    data: data?.data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
