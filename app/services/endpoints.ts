export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyResetToken: "/auth/verify-reset-token",
  },
  backoffice: {
    dashboard: "/backoffice/dashboard",
    users: "/backoffice/users",
    usersSummary: "/backoffice/users/summary",
    userById: (userId: string) => `/backoffice/users/${userId}`,
    verifyUser: (userId: string) => `/backoffice/users/${userId}/verify`,
    activateUser: (userId: string) => `/backoffice/users/${userId}/activate`,
    deactivateUser: (userId: string) => `/backoffice/users/${userId}/deactivate`,
    changeUserRole: (userId: string) => `/backoffice/users/${userId}/role`,
    lockUser: (userId: string) => `/backoffice/users/${userId}/lock`,
    unlockUser: (userId: string) => `/backoffice/users/${userId}/unlock`,
    rejectUser: (userId: string) => `/backoffice/users/${userId}/approve`,
    onboardUser: "/backoffice/users/onboard",
    admins: "/backoffice/admins",
    groupsPending: "/backoffice/groups/pending",
    approveGroup: (groupId: string) => `/backoffice/groups/${groupId}/approve`,
    events: "/backoffice/events",
    pendingEvents: "/backoffice/events/pending",
    approveEvent: (eventId: string) => `/backoffice/events/${eventId}/approve`,
    pendingDealRooms: "/backoffice/dealrooms/pending",
    approveDealRoom: (roomId: string) => `/dealrooms/${roomId}/approve`,
    moderationPosts: "/backoffice/content/posts",
    moderationResources: "/backoffice/content/resources",
    moderationResourceById: (resourceId: string) =>
      `/backoffice/content/resources/${resourceId}`,
    archiveResource: (resourceId: string) =>
      `/backoffice/content/resources/${resourceId}/archive`,
  },
  events: {
    create: "/events",
    byId: (eventId: string) => `/events/${eventId}`,
  },
  newsfeed: {
    list: "/newsfeed",
    byId: (postId: string) => `/newsfeed/${postId}`,
  },
  dealrooms: {
    list: "/dealrooms",
    byId: (roomId: string) => `/dealrooms/${roomId}`,
    members: (roomId: string) => `/dealrooms/${roomId}/members`,
    memberById: (roomId: string, userId: string) =>
      `/dealrooms/${roomId}/members/${userId}`,
  },
  notifications: {
    sendEmail: "/notifications/send-email",
  },
  profile: {
    get: "/users/profile",
    setup: "/users/profile/setup",
    update: "/users/profile",
    avatar: "/users/profile/avatar",
    changePassword: "/users/profile/change-password",
    preferences: "/users/preferences",
  },
} as const;
