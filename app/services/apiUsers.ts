import type { User } from "@/lib/type";

const BACKOFFICE_BASE_URL = "/stp//api/backoffice";

export interface UsersResponse {
  status: boolean;
  message: string;
  data: User[];
}

export async function fetchUsers(
  page: number = 1,
  perPage: number = 10
): Promise<UsersResponse> {
  const token = localStorage.getItem("commuta_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${BACKOFFICE_BASE_URL}/users?page=${page}&perPage=${perPage}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch users");
  }

  const data: UsersResponse = await response.json();
  return data;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  emailAddress: string;
}

export async function createUser(payload: CreateUserPayload): Promise<void> {
  const token = localStorage.getItem("commuta_token");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${BACKOFFICE_BASE_URL}/users/onboard`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to create user");
  }
}
