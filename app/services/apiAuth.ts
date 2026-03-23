export interface LoginPayload {
  emailAddress: string;
  password: string;
}

export interface LoginData {
  token: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  name: string;
  role: string;
  isOnboarded: boolean;
  passwordChangeRequired: boolean;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: LoginData;
}

export const API_BASE_URL = "/stp//api/auth";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || "Login failed");
    }

    const result: LoginResponse = await response.json();

    // Save token and user info in localStorage
    if (result?.data?.token) {
      localStorage.setItem("commuta_token", result.data.token);
      localStorage.setItem("commuta_user_name", result.data.name);
      localStorage.setItem("commuta_user_email", result.data.email);
    }

    return result;
  } catch (error: any) {
    console.error("Login Error:", error);
    throw new Error(error?.message || "Unable to login");
  }
}
