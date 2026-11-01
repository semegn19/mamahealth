import { apiRequest, clearTokens, setTokens } from "./client";

export type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  user_id: string;
  email: string;
};

export type SignupResponse = {
  status: "verification_required" | string;
  message: string;
};

export const authApi = {
  async signup(email: string, password: string): Promise<SignupResponse> {
    return apiRequest<SignupResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      setTokens(data.access_token, data.refresh_token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<void>("/auth/logout", {
        method: "POST",
      });
    } finally {
      clearTokens();
    }
  },

  async forgotPassword(email: string): Promise<{ status: string; message: string }> {
    return apiRequest<{ status: string; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(tokenHash: string, newPassword: string): Promise<{ status: string }> {
    return apiRequest<{ status: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token_hash: tokenHash, new_password: newPassword }),
    });
  },
};
