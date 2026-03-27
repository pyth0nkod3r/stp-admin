import type { DealRoom } from "@/lib/type";
import { API_BASE_URL } from "./config";


export interface DealRoomsResponse {
  status: boolean;
  message: string;
  data: DealRoom[];
}

export async function fetchDealRooms(): Promise<DealRoomsResponse> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE_URL}/dealroom`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    redirect: "follow",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch deal rooms");
  }

  return response.json();
}

export interface CreateDealRoomPayload {
  roomName: string;
  roomDescription: string;
  members: string[];
  document?: File;
}

export async function createDealRoom(
  payload: CreateDealRoomPayload
): Promise<{ status: boolean; message: string }> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

  const formdata = new FormData();
  formdata.append("roomName", payload.roomName);
  formdata.append("roomDescription", payload.roomDescription);
  payload.members.forEach((id, i) => {
    formdata.append(`members[${i}]`, id);
  });
  if (payload.document) {
    formdata.append("document", payload.document);
  }

  const response = await fetch(`${API_BASE_URL}/dealroom`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formdata,
    redirect: "follow",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "Failed to create deal room");
  }

  return result;
}
