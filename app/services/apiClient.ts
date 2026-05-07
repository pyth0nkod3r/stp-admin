import { clearAuthAndRedirect } from "./authUtils";
import { API_BASE_URL } from "./config";

export interface ApiEnvelope<T> {
  status?: boolean | number;
  error?: boolean;
  message?: string;
  data: T;
}

type Primitive = string | number | boolean | null | undefined;
type QueryValue = Primitive | Primitive[];

export interface ApiRequestOptions extends Omit<RequestInit, "headers"> {
  auth?: boolean;
  headers?: HeadersInit;
  query?: Record<string, QueryValue>;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const rawPath = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  if (!query) return rawPath;

  const url = rawPath.startsWith("http")
    ? new URL(rawPath)
    : new URL(rawPath, "http://localhost");
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null && entry !== "") {
          url.searchParams.append(key, String(entry));
        }
      });
      return;
    }
    url.searchParams.set(key, String(value));
  });

  if (rawPath.startsWith("http")) return url.toString();
  return `${url.pathname}${url.search}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorFromPayload(payload: unknown, fallbackMessage: string): string {
  if (payload && typeof payload === "object") {
    const maybe = payload as Record<string, unknown>;
    if (typeof maybe.message === "string") return maybe.message;
    if (typeof maybe.error === "string") return maybe.error;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return fallbackMessage;
}

export function extractData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { auth = true, query, headers, ...rest } = options;
  const token = typeof window !== "undefined" ? localStorage.getItem("stp_token") : null;

  if (auth && !token) {
    throw new Error("Not authenticated");
  }

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  if (headers) {
    const normalized = new Headers(headers);
    normalized.forEach((value, key) => {
      finalHeaders[key] = value;
    });
  }

  if (auth && token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const hasFormDataBody = typeof FormData !== "undefined" && rest.body instanceof FormData;
  if (!hasFormDataBody && rest.body && !("Content-Type" in finalHeaders)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired");
    }
    throw new Error(
      errorFromPayload(payload, `Request failed with status ${response.status}`)
    );
  }

  return payload as T;
}
