import { fetchDashboardSummary } from "@/services/apiDashboard";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useEffect, useState } from "react";

export function useDashboard() {
  const summary = useDashboardStore((state) => state.summary);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const error = useDashboardStore((state) => state.error);
  const setSummary = useDashboardStore((state) => state.setSummary);
  const setIsLoading = useDashboardStore((state) => state.setIsLoading);
  const setError = useDashboardStore((state) => state.setError);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("stp_token") : null;
    console.log("[useDashboard] Auth check: token exists?", !!token);
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || hasInitialized) {
      console.log("[useDashboard] Skipping fetch: isAuthenticated=", isAuthenticated, "hasInitialized=", hasInitialized);
      return;
    }

    const fetchData = async () => {
      console.log("[useDashboard] Starting fetch...");
      setIsLoading(true);
      setError(null);

      try {
        console.log("[useDashboard] Calling fetchDashboardSummary()");
        const response = await fetchDashboardSummary();
        console.log("[useDashboard] Full API response:", response);
        // API response structure: { summary: {...}, newUsers: [...], pendingGroups, etc }
        const summaryData = response.data?.summary || response.data;
        console.log("[useDashboard] Extracted summary:", summaryData);
        setSummary(summaryData);
      } catch (error: any) {
        console.error("[useDashboard] API error:", error?.message || error);
        setError(error?.message || "Failed to fetch dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setHasInitialized(true);
  }, [isAuthenticated, hasInitialized]);

  return {
    data: summary,
    isLoading,
    error,
  };
}
