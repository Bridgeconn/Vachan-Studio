// src/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null; // session token (for generating API keys)
  apiKey: string | null; // API key (for AI API calls)
  apiKeyExpiry: number | null; // timestamp when API key expires
  userId: string | null; // user ID (for generating API keys)
  isAuthenticated: boolean;
  login: (token: string, userId: string) => void;
  setApiKey: (apiKey: string, expiresInSeconds: number) => void;
  logout: () => void;
  isApiKeyExpiringSoon: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      apiKey: null,
      apiKeyExpiry: null,
      userId: null,
      isAuthenticated: false,

      login: (token: string, userId: string) => {
        set({ token, userId, isAuthenticated: true });
      },

      setApiKey: (apiKey: string, expiresInSeconds: number) => {
        set({
          apiKey,
          apiKeyExpiry: Date.now() + expiresInSeconds * 1000,
        });
      },

      logout: () => {
        set({
          token: null,
          apiKey: null,
          apiKeyExpiry: null,
          userId: null,
          isAuthenticated: false,
        });
      },

      isApiKeyExpiringSoon: () => {
        const { apiKeyExpiry } = get();
        if (!apiKeyExpiry) return true;
        // Regenerate if expiring in next 2 minutes
        return Date.now() > apiKeyExpiry - 2 * 60 * 1000;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);