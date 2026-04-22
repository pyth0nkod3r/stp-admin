import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export interface SendEmailNotificationPayload {
  recipient_id: string;
  type:
    | "CONNECTION_REQUEST"
    | "CONNECTION_ACCEPTED"
    | "NEW_MESSAGE"
    | "NEW_NEWSFEED"
    | "POST_ENGAGEMENT"
    | "SUPPORT_RESPONSE"
    | "ONBOARDING_WELCOME"
    | "EVENT_APPROVAL_PENDING"
    | "EVENT_UPDATE";
  context_data?: Record<string, unknown>;
}

export async function sendEmailNotification(
  payload: SendEmailNotificationPayload
): Promise<void> {
  await apiRequest(API_ENDPOINTS.notifications.sendEmail, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
