import type { Contact } from "@/lib/type";
import { API_BASE_URL } from "./config";



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
const data = await response.json();

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch contacts");
  }

//   console.log(data, "contacts");

  return data.data;
}
