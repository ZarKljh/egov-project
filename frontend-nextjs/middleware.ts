/**
 * ============================================
 * [면접 핵심] Next.js Middleware - 라우트 보호
 * ============================================
 * 
 * [Spring Boot 비교]
 * Spring Boot (Backend):
 *   @Configuration
 *   public class SecurityConfig {
 *       http.authorizeRequests()
 *           .antMatchers("/admin/**").hasRole("ADMIN")
 *           .anyRequest().permitAll();
 *   }
 * 
 * Next.js (Frontend):
 *   middleware.ts에서 서버 사이드 라우트 보호
 * 
 * [동작 원리]
 * 1. 요청이 들어오면 middleware 함수 실행 (서버 사이드)
 * 2. 쿠키에서 auth_token과 user_role 확인
 * 3. /admin 경로 접근 시 인증 및 권한 체크
 * 4. 인증 실패 시 /login으로 리다이렉트
 * 5. 권한 부족 시 홈으로 리다이렉트
 * 
 * [면접 질문 예상]
 * Q: 프론트엔드에서 라우트를 어떻게 보호하나요?
 * A: Next.js Middleware에서 쿠키 기반 인증 체크
 *    Spring Boot는 서버 사이드에서 SecurityFilterChain으로 처리
 * 
 * Q: 클라이언트 사이드 보호와 서버 사이드 보호의 차이는?
 * A: 클라이언트는 우회 가능하므로 서버 사이드 검증 필수
 *    이 미들웨어는 서버 사이드에서 실행되어 보안 강화
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * [면접 핵심] Next.js Middleware 함수
 * Spring Boot: SecurityFilterChain의 Filter와 유사한 역할
 * 
 * [실행 시점]
 * - 서버 사이드에서 실행 (Edge Runtime)
 * - 페이지 렌더링 전에 실행됨
 * - 모든 요청에 대해 실행 (matcher로 필터링)
 * 
 * @param request NextRequest 객체 (쿠키, URL 등 접근 가능)
 * @returns NextResponse (리다이렉트 또는 다음 미들웨어로 전달)
 */
export function middleware(request: NextRequest) {
  // [1단계] 쿠키에서 인증 정보 추출
  // Spring Boot: SecurityContext에서 Authentication 객체 가져오기
  // Next.js: request.cookies.get()으로 쿠키 읽기
  const token = request.cookies.get("auth_token");
  const role = request.cookies.get("user_role");
  const pathname = request.nextUrl.pathname;

  // [2단계] Admin 페이지 접근 시 인증 및 권한 체크
  // Spring Boot: @PreAuthorize("hasRole('ADMIN')")
  if (pathname.startsWith("/admin")) {
    // [인증 체크] 토큰이 없으면 로그인 페이지로 리다이렉트
    // Spring Boot: Authentication이 없으면 401 Unauthorized 반환
    if (!token) {
      // [보안] 환경 변수에서 로그인 URL 가져오기
      const loginUrlPath = process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
      const loginUrl = new URL(loginUrlPath, request.url);
      // 로그인 후 다시 admin 페이지로 돌아올 수 있도록 returnUrl 설정
      // Spring Boot: SavedRequestAwareAuthenticationSuccessHandler와 유사
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // [권한 체크] ADMIN만 접근 가능
    // Spring Boot: hasRole("ADMIN") 체크
    if (role?.value !== "ADMIN") {
      // USER 권한이면 홈으로 리다이렉트
      // Spring Boot: AccessDeniedException 발생, 403 Forbidden 반환
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // [3단계] 인증 통과 시 다음 미들웨어 또는 페이지로 진행
  // Spring Boot: FilterChain.doFilter()와 유사
  return NextResponse.next();
}

/**
 * [면접 핵심] Middleware 실행 경로 지정
 * Spring Boot: SecurityConfig에서 antMatchers()로 경로 지정
 * Next.js: config.matcher로 경로 패턴 지정
 * 
 * [설명]
 * - ["/admin/:path*"]: /admin으로 시작하는 모든 경로에 대해 실행
 * - 성능 최적화: 필요한 경로에만 미들웨어 실행
 */
export const config = {
  matcher: ["/admin/:path*"],  // /admin, /admin/dashboard 등 모든 /admin 하위 경로
};
