import { clearAuthAndRedirect } from "@/services/authUtils";

/**
 * Utility function to handle API errors, especially 401 Unauthorized
 * Automatically redirects to login on authentication failures
 */
export const handleApiError = (response: Response | Error, errorDetails?: any) => {
  // Check if it's a Response object with 401 status
  if (response instanceof Response) {
    if (response.status === 401) {
      clearAuthAndRedirect();
      throw new Error("Session expired. Redirecting to login...");
    }
    
    // Also check error details for UNAUTHORIZED code
    if (errorDetails?.error_code === "UNAUTHORIZED") {
      clearAuthAndRedirect();
      throw new Error("Session expired. Redirecting to login...");
    }
  }
  
  // For other errors, just rethrow
  throw response instanceof Error ? response : new Error("An error occurred");
};

/**
 * Create API fetch with automatic 401 handling
 */
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("stp_token");
  
  if (!token) {
    clearAuthAndRedirect();
    throw new Error("No authentication token found");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Check for 401 immediately
  if (response.status === 401) {
    clearAuthAndRedirect();
    throw new Error("Session expired. Redirecting to login...");
  }

  return response;
};

