import axios, { isAxiosError, type AxiosError } from "axios";
import { tokenStorage } from "@/lib/auth/token";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 요청 인터셉터: 모든 요청에 JWT 토큰을 자동으로 추가합니다.
 */
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터: 통일된 응답 형식 처리 및 401 에러 시 토큰 리프레시
 */
apiClient.interceptors.response.use(
  (response) => {
    // 백엔드가 {success, data} 형식으로 응답하는 경우 data 추출
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clearTokens();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data as { access: string };

        tokenStorage.setAccessToken(access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

type ErrorPayload = {
  detail?: string;
  error?: {
    message?: string;
  };
  message?: string;
  errors?: Record<string, string | string[]>;
};

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage = "API request failed."
) => {
  if (isAxiosError(error)) {
    // 404 에러 처리
    if (error.response?.status === 404) {
      return "요청한 리소스를 찾을 수 없습니다. API 서버가 실행 중인지 확인해주세요.";
    }

    const payload = error.response?.data as ErrorPayload | undefined;

    if (typeof payload?.detail === "string") {
      return payload.detail;
    }

    if (typeof payload?.error?.message === "string") {
      return payload.error.message;
    }

    if (typeof payload?.message === "string") {
      return payload.message;
    }

    // 백엔드 serializer 에러 형식 처리
    if (payload?.errors && typeof payload.errors === "object") {
      const errorMessages = Object.entries(payload.errors)
        .map(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${messageArray.join(", ")}`;
        })
        .join("; ");
      if (errorMessages) {
        return errorMessages;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export { apiClient, isAxiosError };
