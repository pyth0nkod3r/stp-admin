import type { Event } from "@/lib/type";
import { API_BASE_URL } from "./config";
import { clearAuthAndRedirect } from "./authUtils";

export interface EventsResponse {
  status: boolean;
  message: string;
  data: Event[];
}

export async function fetchEvents(): Promise<EventsResponse> {
  // Mock implementation - instant response for better UX
  return {
    status: true,
    message: "Events fetched successfully",
    data: [
      {
        eventId: "1",
        type: "online",
        format: "webinar",
        name: "Alumni Networking Session",
        timeZone: "UTC",
        startTime: "2026-05-15T14:00:00Z",
        endTime: "2026-05-15T16:00:00Z",
        description: "Monthly alumni networking session",
        externalLink: "https://zoom.us/j/example",
        address: "",
        venue: "",
        createdBy: "admin",
        createdAt: "2026-04-01T10:00:00Z",
        updatedAt: "2026-04-01T10:00:00Z",
        coverImageUrl: "",
      },
      {
        eventId: "2",
        type: "physical",
        format: "conference",
        name: "Tech Career Fair 2026",
        timeZone: "UTC",
        startTime: "2026-06-20T09:00:00Z",
        endTime: "2026-06-20T17:00:00Z",
        description: "Annual tech career fair for alumni",
        externalLink: "",
        address: "123 University Ave, City, State",
        venue: "Main Campus Center",
        createdBy: "admin",
        createdAt: "2026-04-05T10:00:00Z",
        updatedAt: "2026-04-05T10:00:00Z",
        coverImageUrl: "",
      },
    ],
  };
}

export async function fetchPendingEvents(): Promise<EventsResponse> {
  // Mock implementation - instant response for better UX
  return {
    status: true,
    message: "Pending events fetched successfully",
    data: [
      {
        eventId: "3",
        type: "online",
        format: "workshop",
        name: "Resume Review Workshop",
        timeZone: "UTC",
        startTime: "2026-04-25T15:00:00Z",
        endTime: "2026-04-25T16:30:00Z",
        description: "Get your resume reviewed by industry experts",
        externalLink: "https://zoom.us/j/workshop",
        address: "",
        venue: "",
        createdBy: "user123",
        createdAt: "2026-04-08T10:00:00Z",
        updatedAt: "2026-04-08T10:00:00Z",
        coverImageUrl: "",
      },
    ],
  };
}



export interface CreateEventPayload {
  type: string;
  name: string;
  timeZone: string;
  startTime: string;
  endTime: string;
  description: string;
  externalLink: string;
  address: string;
  venue: string;
  coverImage?: File;
}

export interface CreateEventResponse {
  status: boolean;
  message: string;
  data: {
    eventId: string;
  };
}

export interface EventDetailResponse {
  status: boolean;
  message: string;
  data: Event;
}

export async function fetchEventById(
  eventId: string
): Promise<EventDetailResponse> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 300));

  const mockEvent = {
    eventId,
    type: "online",
    format: "webinar",
    name: "Mock Event Details",
    timeZone: "UTC",
    startTime: "2026-05-15T14:00:00Z",
    endTime: "2026-05-15T16:00:00Z",
    description: "This is a mock event for testing purposes",
    externalLink: "https://zoom.us/j/mock",
    address: "",
    venue: "",
    createdBy: "admin",
    createdAt: "2026-04-01T10:00:00Z",
    updatedAt: "2026-04-01T10:00:00Z",
    coverImageUrl: "",
  };

  return {
    status: true,
    message: "Event details fetched successfully",
    data: mockEvent,
  };
}

export async function createEvent(
  payload: CreateEventPayload
): Promise<CreateEventResponse> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Mock: Created event: ${payload.name}`);

  return {
    status: true,
    message: "Event created successfully",
    data: {
      eventId: `mock-event-${Date.now()}`,
    },
  };
}
