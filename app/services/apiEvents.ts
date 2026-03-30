import type { Event } from "@/lib/type";
import { API_BASE_URL } from "./config";

export interface EventsResponse {
  status: boolean;
  message: string;
  data: Event[];
}

export async function fetchEvents(): Promise<EventsResponse> {
  const response = await fetch(`${API_BASE_URL}/events`, {
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

<<<<<<< HEAD
export interface EventDetailResponse {
  status: boolean;
  message: string;
  data: Event;
}

export async function fetchEventById(
  eventId: string
): Promise<EventDetailResponse> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    redirect: "follow",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch event details");
  }

  return response.json();
}

=======
>>>>>>> parent of 0d0e7b3 (Merge branch 'main' of github.com:pyth0nkod3r/stp-admin-1)
export async function createEvent(
  payload: CreateEventPayload
): Promise<CreateEventResponse> {
  const token = localStorage.getItem("stp_token");
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

  const response = await fetch(`${API_BASE_URL}/events`, {
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
