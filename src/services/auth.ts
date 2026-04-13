import { API_BASE_URL } from '@/config/constants';
import type { LoginResponse } from '@/types';

class AuthService {
  private accessToken: string | null = null;

  async login(username: string, password: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', username);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', 'string');
    formData.append('client_secret', 'string');

    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error('Login failed');
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
}

export const authService = new AuthService();