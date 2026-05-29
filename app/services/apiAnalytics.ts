import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface AnalyticsStats {
  totalMembers: number;
  onboardedMembers: number;
  totalGroups: number;
  totalDealRooms: number;
  totalPosts: number;
  totalEvents: number;
  totalCountries: number;
}

export interface CountryAnalytics {
  country: string;
  memberCount: number;
}

export interface SectorAnalytics {
  sector: string;
  memberCount: number;
}

export interface ActiveUserAnalytics {
  userId: string;
  firstName: string;
  lastName: string;
  activityScore: number;
}

export interface AnalyticsResponse {
  stats: AnalyticsStats;
  byCountry: CountryAnalytics[];
  bySector: SectorAnalytics[];
  activeUsers: ActiveUserAnalytics[];
}

export interface AnalyticsFilters {
  country?: string;
  sector?: string;
  timeframe?: string;
}

export async function fetchPlatformAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsResponse> {
  const query: Record<string, string> = {};
  if (filters?.country && filters.country !== "all") {
    query.country = filters.country;
  }
  if (filters?.sector && filters.sector !== "all") {
    query.sector = filters.sector;
  }
  if (filters?.timeframe && filters.timeframe !== "all") {
    query.timeframe = filters.timeframe;
  }

  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.analytics, {
    method: "GET",
    query,
  });

  // Extract from backend response envelope if present
  const data = result?.data ?? result ?? {};

  // Safeguard against missing keys and format inconsistencies
  return {
    stats: {
      totalMembers: Number(data.stats?.totalMembers ?? data.stats?.total ?? 0),
      onboardedMembers: Number(data.stats?.onboardedMembers ?? data.stats?.onboarded ?? 0),
      totalGroups: Number(data.stats?.totalGroups ?? 0),
      totalDealRooms: Number(data.stats?.totalDealRooms ?? 0),
      totalPosts: Number(data.stats?.totalPosts ?? 0),
      totalEvents: Number(data.stats?.totalEvents ?? 0),
      totalCountries: Number(data.stats?.totalCountries ?? 0),
    },
    byCountry: Array.isArray(data.byCountry) ? data.byCountry : [],
    bySector: Array.isArray(data.bySector) ? data.bySector : [],
    activeUsers: Array.isArray(data.activeUsers) ? data.activeUsers : [],
  };
}
