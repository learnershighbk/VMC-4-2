"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import { tokenStorage } from "@/lib/auth/token";
import type { CurrentUserSnapshot } from "../types";

type ApiUser = {
  id: string;
  username: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export const useCurrentUserFromApi = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<CurrentUserSnapshot> => {
      const accessToken = tokenStorage.getAccessToken();

      if (!accessToken) {
        return { status: "unauthenticated", user: null };
      }

      try {
        const response = await apiClient.get<ApiUser>("/api/auth/me/");
        const apiUser = response.data;

        return {
          status: "authenticated",
          user: {
            id: apiUser.id,
            email: apiUser.email ?? null,
            username: apiUser.username,
            isAdmin: apiUser.is_admin,
            appMetadata: {},
            userMetadata: {},
          },
        };
      } catch (error) {
        const statusCode = (error as { response?: { status?: number } })
          .response?.status;

        if (statusCode === 401) {
          tokenStorage.clearTokens();
        }

        return { status: "unauthenticated", user: null };
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

