/**
 * ============================================
 * [면접 핵심] Next.js Header 컴포넌트 - 인증 상태 표시
 * ============================================
 *
 * [Spring Boot 비교]
 * Spring Boot (Backend):
 *   @ControllerAdvice 또는 Interceptor에서 Model에 사용자 정보 추가
 *   또는 Thymeleaf에서 SecurityContext 접근
 *
 * Next.js (Frontend):
 * - JWT 토큰을 쿠키에서 읽어서 디코딩
 * - 역할에 따라 다른 메뉴 표시
 * - 로그아웃 기능
 *
 * [핵심 기능]
 * 1. JWT 토큰 디코딩하여 사용자 역할 추출
 * 2. 역할 기반 조건부 렌더링 (ADMIN/USER)
 * 3. 로그아웃 처리 (쿠키 삭제)
 *
 * [면접 질문 예상]
 * Q: JWT 토큰을 어떻게 읽고 파싱하나요?
 * A: 쿠키에서 토큰 읽기 → jwtDecode()로 디코딩 → role 추출
 *    Spring Boot: SecurityContext에서 Authentication.getAuthorities()로 역할 확인
 *
 * Q: 클라이언트에서 JWT를 디코딩해도 안전한가요?
 * A: JWT는 Base64 인코딩되어 있어 누구나 디코딩 가능 (서명 검증은 서버에서만)
 *    역할 정보는 공개 정보이므로 클라이언트에서 읽어도 문제없음
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode"; // JWT 토큰 디코딩 라이브러리

/**
 * [면접 핵심] JWT 토큰 내부 구조 정의
 * Spring Boot: JWT Claims 구조와 동일
 *
 * [JWT 구조]
 * - sub: Subject (사용자 ID) - User 모델의 getJWTIdentifier() 반환값
 * - role: 사용자 역할 (ADMIN/USER) - User 모델의 getJWTCustomClaims() 반환값
 * - exp: 만료 시간 (Unix timestamp)
 * - iat: 발급 시간 (Unix timestamp)
 */
interface AuthToken {
  role: "ADMIN" | "USER";
  sub: string; // 사용자 ID (user_id)
  exp: number; // 만료 시간 (Unix timestamp)
  iat: number; // 발급 시간 (Unix timestamp)
}

export default function Header() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<"ADMIN" | "USER" | null>(null);
  const boardUrl = process.env.NEXT_PUBLIC_EGOV_BOARD_URL;
  const loginUrl = "/login";
  const pathname = usePathname();

  /**
   * [면접 핵심] 컴포넌트 마운트 시 JWT 토큰에서 역할 추출 및 만료 체크
   * Spring Boot: SecurityContext에서 Authentication.getAuthorities()로 역할 확인
   * Next.js: 쿠키에서 토큰 읽기 → jwtDecode()로 디코딩 → role 추출 → 만료 체크
   *
   * [동작 원리]
   * 1. 쿠키에서 auth_token 읽기
   * 2. jwtDecode()로 토큰 디코딩 (Base64 디코딩)
   * 3. 토큰 만료 시간(exp) 체크
   * 4. 만료되지 않았으면 decoded.role로 역할 추출
   * 5. 만료되었으면 쿠키 삭제 및 로그인 페이지로 리다이렉트
   * 6. 상태에 저장하여 조건부 렌더링에 사용
   */
  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      try {
        // [핵심] JWT 토큰 디코딩
        // Spring Boot: Jwts.parser().setSigningKey(secret).parseClaimsJws(token)
        // Next.js: jwtDecode()로 클라이언트 사이드 디코딩 (서명 검증 없음)
        // [주의] 클라이언트에서는 서명 검증 불가능, 서버에서만 검증 가능
        const decoded = jwtDecode<AuthToken>(token);

        // [토큰 만료 체크] exp (만료 시간)가 현재 시간보다 작으면 만료됨
        const currentTime = Math.floor(Date.now() / 1000); // Unix timestamp (초 단위)
        if (decoded.exp && decoded.exp < currentTime) {
          // 토큰이 만료된 경우
          Cookies.remove("auth_token");
          Cookies.remove("refresh_token");
          Cookies.remove("user_role");
          setUserRole(null);

          // 이미 로그인 페이지에 있으면 리다이렉트하지 않음 (무한 루프 방지)
          if (pathname !== loginUrl) {
            console.warn("토큰이 만료되었습니다. 로그인 페이지로 이동합니다.");
            router.push(loginUrl);
          }
          return;
        }

        // [권한 체크] ADMIN이 아닌 경우 담당자 페이지 접근 차단
        if (decoded.role !== "ADMIN" && pathname.startsWith("/admin")) {
          console.warn("ADMIN 권한이 필요합니다.");
          setUserRole(null);
          router.push("/");
          return;
        }

        // 토큰이 유효하고 권한이 있으면 역할 설정
        setUserRole(decoded.role);
      } catch (error) {
        console.error("토큰 해독 실패:", error);
        // 토큰이 손상되었거나 형식이 잘못된 경우
        Cookies.remove("auth_token");
        Cookies.remove("refresh_token");
        Cookies.remove("user_role");
        setUserRole(null);
      }
    } else {
      // 토큰이 없으면 로그아웃 상태
      setUserRole(null);
    }
  }, [pathname, router]);

  /**
   * [면접 핵심] 로그아웃 핸들러
   * Spring Boot: SecurityContextLogoutHandler.logout() 또는 세션 무효화
   * Next.js: 쿠키 삭제 후 로그인 페이지로 리다이렉트
   *
   * [주의사항]
   * - window.location.href 사용: 완전한 페이지 리로드로 상태 초기화
   * - router.push() 대신 사용하는 이유: 모든 상태를 완전히 초기화하기 위해
   * - refresh_token도 함께 삭제하여 완전한 로그아웃 처리
   */
  const handleLogout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_role");
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
    window.location.href = loginUrl; // 세션 완전 초기화를 위해 href 사용
  };

  // 로그인/회원가입 페이지에서는 Header를 렌더링하지 않음
  // if (
  //   pathname === "/login" ||
  //   pathname === "/register" ||
  //   pathname === "/register/success"
  // ) {
  //   return null;
  // }

  return (
    <header className="no-print w-full h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold text-[#003366]">
          eGov 민원 문의 시스템
        </Link>

        <nav className="flex gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-[#003366]">
            홈
          </Link>

          {/* USER 권한 이상이면 보임 (USER, ADMIN 모두) */}
          {(userRole === "USER" || userRole === "ADMIN") && (
            <>
              <Link href="/forms" className="hover:text-[#003366]">
                민원 서식
              </Link>
              <a href={boardUrl} className="hover:text-[#003366]">
                민원문의(JSP)
              </a>
            </>
          )}

          {/* ADMIN 권한만 보임 */}
          {userRole === "ADMIN" && (
            <Link href="/admin" className="hover:text-[#003366]">
              통계현황(Admin)
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {userRole && (
          <span className="text-sm text-slate-500 font-medium">
            <span className="text-[#003366] font-bold">{userRole}</span> 권한
            접속 중
          </span>
        )}
        {userRole ? (
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">
              로그인
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
