// Generate realistic mock data for the admin dashboard

export interface DashboardData {
  status: number;
  error: boolean;
  message: string;
  data: {
    metadata: {
      period: number;
      periodLabel: string;
    };
    overview: {
      riders: {
        total: number;
        recent: number;
      };
      drivers: {
        total: number;
        recent: number;
      };
      rides: {
        total: number;
        recent: number;
      };
      users: {
        total: number;
        recent: number;
      };
    };
    trends: Array<{
      date: string;
      label: string;
      riders: number;
      drivers: number;
    }>;
  };
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isOnboarded: string;
  passwordChangeRequired: string;
  isActive: boolean;
  isLocked: boolean;
  isVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  eventId: string;
  type: string;
  format: string;
  eventStatus?: "approved" | "pending" | "rejected";
  name: string;
  timeZone: string;
  startTime: string;
  endTime: string;
  description: string;
  externalLink: string;
  address: string;
  venue: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  coverImageUrl: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  category: string;
  altPhoneNumber: string | null;
  altEmail: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
}
