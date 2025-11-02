import { NextResponse, type NextRequest } from "next/server";
import { shouldProtectPath } from "@/constants/auth";

/**
 * Next.js Middleware
 * 
 * JWT 토큰은 localStorage에 저장되므로 middleware에서 접근할 수 없습니다.
 * 실제 인증 확인은 클라이언트 사이드(ProtectedLayout)에서 처리합니다.
 * 
 * 이 middleware는 기본적인 경로 보호만 수행하며, 세부 인증은
 * src/app/(protected)/layout.tsx에서 처리됩니다.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 공개 경로는 허용
  if (!shouldProtectPath(pathname)) {
    return NextResponse.next();
  }

  // 보호된 경로는 그대로 통과 (클라이언트 사이드에서 인증 확인)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
