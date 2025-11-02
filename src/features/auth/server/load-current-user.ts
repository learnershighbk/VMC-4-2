import "server-only";

import type { CurrentUserSnapshot } from "../types";

/**
 * 서버 사이드 사용자 로드
 * 
 * JWT 토큰은 localStorage에 저장되므로 서버 컴포넌트에서 접근할 수 없습니다.
 * 초기 상태는 항상 unauthenticated로 설정하고, 클라이언트에서 API를 통해 확인합니다.
 */
export const loadCurrentUser = async (): Promise<CurrentUserSnapshot> => {
  return { status: "unauthenticated", user: null };
};
