/**
 * JWT 토큰 관리 유틸리티
 * localStorage에 access token과 refresh token을 저장/로드/삭제합니다.
 */

const ACCESS_TOKEN_KEY = "jwt_access_token";
const REFRESH_TOKEN_KEY = "jwt_refresh_token";

export type TokenPair = {
  access: string;
  refresh: string;
};

export const tokenStorage = {
  /**
   * Access Token을 저장합니다.
   */
  setAccessToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  /**
   * Refresh Token을 저장합니다.
   */
  setRefreshToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  /**
   * Access Token과 Refresh Token을 저장합니다.
   */
  setTokens: ({ access, refresh }: TokenPair): void => {
    tokenStorage.setAccessToken(access);
    tokenStorage.setRefreshToken(refresh);
  },

  /**
   * Access Token을 가져옵니다.
   */
  getAccessToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Refresh Token을 가져옵니다.
   */
  getRefreshToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * 저장된 토큰 쌍을 가져옵니다.
   */
  getTokens: (): TokenPair | null => {
    const access = tokenStorage.getAccessToken();
    const refresh = tokenStorage.getRefreshToken();

    if (access && refresh) {
      return { access, refresh };
    }

    return null;
  },

  /**
   * 모든 토큰을 삭제합니다.
   */
  clearTokens: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * 토큰이 저장되어 있는지 확인합니다.
   */
  hasTokens: (): boolean => {
    return tokenStorage.getTokens() !== null;
  },
};

