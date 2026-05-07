import type { Contact } from "@/lib/type";
import { API_BASE_URL } from "./config";
import { clearAuthAndRedirect } from "./authUtils";



export async function getContacts(): Promise<Contact[]> {
  const token = localStorage.getItem("stp_token");
  if (!token) throw new Error("Not authenticated");

   const response = await fetch(`${API_BASE_URL}/contacts`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
    
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch contacts");
  }

  const data = await response.json();

//   console.log(data, "contacts");

  return data.data;
}
