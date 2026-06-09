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

export interface CohortAnalytics {
  cohort: string;
  memberCount: number;
}

export interface AnalyticsResponse {
  stats: AnalyticsStats;
  byCountry: CountryAnalytics[];
  bySector: SectorAnalytics[];
  byCohort: CohortAnalytics[];
  activeUsers: ActiveUserAnalytics[];
}

export interface AnalyticsFilters {
  country?: string;
  sector?: string;
  timeframe?: string;
  cohort?: string;
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
  if (filters?.cohort && filters.cohort !== "all") {
    query.cohort = filters.cohort;
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
    byCountry: Array.isArray(data.byCountry)
      ? data.byCountry.map((item: any) => ({
          country: String(item.country ?? ""),
          memberCount: Number(item.memberCount ?? item.member_count ?? item.count ?? item.members ?? item.value ?? 0),
        }))
      : [],
    bySector: Array.isArray(data.bySector)
      ? data.bySector.map((item: any) => ({
          sector: String(item.sector ?? ""),
          memberCount: Number(item.memberCount ?? item.member_count ?? item.count ?? item.members ?? item.value ?? 0),
        }))
      : [],
    byCohort: Array.isArray(data.byCohort)
      ? data.byCohort.map((item: any) => ({
          cohort: String(item.cohort ?? ""),
          memberCount: Number(item.memberCount ?? item.member_count ?? item.count ?? item.members ?? item.value ?? 0),
        }))
      : [],
    activeUsers: Array.isArray(data.activeUsers) ? data.activeUsers : [],
  };
}

export interface TimeframeOption {
  label: string;
  value: number;
}

export interface AnalyticsFiltersData {
  cohorts: string[];
  countries: string[];
  sectors: string[];
  timeframes: TimeframeOption[];
}

export interface AnalyticsFiltersResponse {
  status: boolean;
  message: string;
  data: AnalyticsFiltersData;
}

export async function fetchAnalyticsFilters(): Promise<AnalyticsFiltersResponse> {
  const result = await apiRequest<any>(API_ENDPOINTS.backoffice.analyticsFilters, {
    method: "GET",
  });
  return {
    status: Boolean(result?.status ?? true),
    message: result?.message ?? "Analytics filters fetched successfully",
    data: {
      cohorts: Array.isArray(result?.data?.cohorts) ? result.data.cohorts : [],
      countries: Array.isArray(result?.data?.countries) ? result.data.countries : [],
      sectors: Array.isArray(result?.data?.sectors) ? result.data.sectors : [],
      timeframes: Array.isArray(result?.data?.timeframes) ? result.data.timeframes : [],
    },
  };
}
