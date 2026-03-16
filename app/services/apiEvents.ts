import type { Event } from "@/lib/type";

const EVENTS_BASE_URL = "/stp//api/events";

export interface EventsResponse {
  status: boolean;
  message: string;
  data: Event[];
}

export async function fetchEvents(): Promise<EventsResponse> {
  const response = await fetch(EVENTS_BASE_URL, {
    method: "GET",
    redirect: "follow",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch events");
  }

  return response.json();
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

export async function createEvent(
  payload: CreateEventPayload
): Promise<CreateEventResponse> {
  const token = localStorage.getItem("commuta_token");
  if (!token) throw new Error("Not authenticated");

  const formdata = new FormData();
  formdata.append("type", payload.type);
  formdata.append("format", "json");
  formdata.append("name", payload.name);
  formdata.append("timeZone", payload.timeZone);
  formdata.append("startTime", payload.startTime);
  formdata.append("endTime", payload.endTime);
  formdata.append("description", payload.description);
  formdata.append("externalLink", payload.externalLink);
  formdata.append("address", payload.address);
  formdata.append("venue", payload.venue);
  if (payload.coverImage) {
    formdata.append("coverImage", payload.coverImage);
  }

  const response = await fetch(EVENTS_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formdata,
    redirect: "follow",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "Failed to create event");
  }

  return result;
}
