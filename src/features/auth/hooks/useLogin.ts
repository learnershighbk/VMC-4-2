"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { tokenStorage } from "@/lib/auth/token";

type LoginCredentials = {
  username: string;
  password: string;
};

type LoginResponse = {
  access: string;
  refresh: string;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>(
        "/api/auth/token/",
        credentials
      );

      const tokens = response.data;
      tokenStorage.setTokens(tokens);

      return tokens;
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, "로그인에 실패했습니다.");
      throw new Error(message);
    },
  });
};

