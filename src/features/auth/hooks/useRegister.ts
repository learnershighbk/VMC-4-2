"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { tokenStorage } from "@/lib/auth/token";

type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
};

type RegisterResponse = {
  access: string;
  refresh: string;
  user: {
    id: string;
    username: string;
    email: string | null;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
  };
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (
      credentials: RegisterCredentials
    ): Promise<RegisterResponse> => {
      const response = await apiClient.post<RegisterResponse>(
        "/api/auth/register/",
        credentials
      );

      const { access, refresh } = response.data;
      tokenStorage.setTokens({ access, refresh });

      return response.data;
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, "회원가입에 실패했습니다.");
      throw new Error(message);
    },
  });
};

