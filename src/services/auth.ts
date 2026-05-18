import { API_BASE_URL, API_BASE_URL_AUTH } from "@/config/constants";

import type { LoginResponse } from "@/types";

class AuthService {
  private accessToken: string | null = null;

  async login(username: string, password: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", username);
    formData.append("password", password);
    formData.append("scope", "");
    formData.append("client_id", "string");
    formData.append("client_secret", "string");

    const response = await fetch(`${API_BASE_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data: LoginResponse = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  logout(): void {
    this.accessToken = null;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  async register(
    email: string,
    password: string,
    firstname?: string,
    lastname?: string,
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL_AUTH}/auth/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstname, lastname }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }
  }

  async forgotPassword(userEmail: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL_AUTH}/auth/user/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: userEmail }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to send recovery code");
    }

    const data = await response.json();
    return data.recovery_flow_id;
  }

  async verifyRecoveryCode(
    flowId: string,
    recoveryCode: string,
  ): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL_AUTH}/auth/user/verify-recovery-code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: flowId, recovery_code: recoveryCode }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Invalid recovery code");
    }

    const data = await response.json();
    return data.settings_flow_id;
  }

  async resetPassword(
    settingsFlowId: string,
    newPassword: string,
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL_AUTH}/auth/user/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        new_password: newPassword,
        settings_flow_id: settingsFlowId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to reset password");
    }
  }
}

export const authService = new AuthService();
