/**
 * ============================================
 * [면접 핵심] Next.js 로그인 페이지
 * ============================================
 * 
 * [Spring Boot 비교]
 * Spring Boot (Backend):
 *   @PostMapping("/api/auth/login")
 *   public ResponseEntity<?> login(@RequestBody LoginRequest request) {
 *       // JWT 토큰 생성 및 반환
 *   }
 * 
 * Next.js (Frontend):
 *   - React Hook Form으로 폼 관리
 *   - Zod로 클라이언트 사이드 유효성 검사
 *   - Axios로 API 호출
 *   - 쿠키에 JWT 토큰 저장
 *   - 역할 기반 리다이렉트
 * 
 * [핵심 개념]
 * 1. React Hook Form: 폼 상태 관리 및 유효성 검사
 * 2. Zod: 스키마 기반 타입 안전한 유효성 검사
 * 3. Axios: HTTP 클라이언트 (Spring Boot의 RestTemplate과 유사)
 * 4. JWT 토큰 관리: 쿠키에 저장하여 인증 상태 유지
 * 5. 역할 기반 라우팅: ADMIN → /admin, USER → 게시판
 * 
 * [면접 질문 예상]
 * Q: 폼 유효성 검사를 어떻게 하나요?
 * A: 클라이언트: Zod 스키마로 실시간 검사, 서버: Laravel Validation
 *    Spring Boot: @Valid + Bean Validation (클라이언트는 JavaScript)
 * 
 * Q: JWT 토큰을 어떻게 저장하나요?
 * A: 쿠키에 저장 (js-cookie 라이브러리)
 *    Spring Boot: 클라이언트에서 localStorage 또는 쿠키에 저장
 */

// src/app/login/page.tsx
"use client";

import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * [면접 핵심] Zod 스키마 - 클라이언트 사이드 유효성 검사
 * Spring Boot: Bean Validation 어노테이션 (@NotBlank, @Size 등)
 * Next.js: Zod 스키마로 타입 안전한 검증
 * 
 * [장점]
 * - 타입스크립트와 통합되어 타입 안전성 보장
 * - 런타임 검증과 컴파일 타임 타입 체크 동시 제공
 */
const loginSchema = z.object({
  username: z.string().min(2, { message: "아이디는 2자 이상이어야 합니다." }),
  password: z.string().min(4, { message: "패스워드는 4자 이상이어야 합니다." }),
});

export default function LoginPage() {
  const router = useRouter();
  
  // [면접 핵심] React Hook Form 설정
  // Spring Boot: @ModelAttribute로 폼 바인딩 (서버 사이드)
  // Next.js: useForm()으로 클라이언트 사이드 폼 관리
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),  // Zod 스키마로 유효성 검사
    defaultValues: {
      username: "",
      password: "",
    },
  });

  /**
   * [면접 핵심] 로그인 제출 핸들러
   * Spring Boot: @PostMapping("/login") 메서드와 통신
   * 
   * [처리 흐름]
   * 1. Axios로 POST /api/auth/login 요청
   * 2. 성공 시 JWT 토큰과 사용자 정보 수신
   * 3. 쿠키에 토큰과 역할 저장
   * 4. 역할에 따라 다른 페이지로 리다이렉트
   */
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      // [1단계] API 호출
      // Spring Boot: RestTemplate.postForEntity() 또는 WebClient.post()
      // Next.js: axiosInstance.post()
      const response = await axiosInstance.post("/auth/login", values);

      if (response.status === 200) {
        console.log("로그인 성공:", response.data);
        
        // [2단계] 응답 데이터 파싱
        // Laravel 응답 형식: { status: 'success', message: '...', data: { token, user } }
        const responseData = response.data.data || response.data; // 하위 호환성
        const token = responseData.token || responseData.access_token; // 둘 다 시도
        const userRole = responseData.user?.role;

        // [3단계] JWT 토큰을 쿠키에 저장
        // Spring Boot: 클라이언트에서 HttpServletResponse.addCookie() 또는 localStorage 사용
        // Next.js: js-cookie 라이브러리로 쿠키 저장
        // [보안] 환경 변수로 쿠키 보안 설정 관리
        if (token) {
          // [보안] 쿠키 옵션을 환경 변수에서 가져오기
          const cookieOptions = {
            expires: 1, // 1일 후 만료
            path: process.env.NEXT_PUBLIC_COOKIE_PATH || "/",
            sameSite: (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE as "strict" | "lax" | "none") || "lax",
            secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
          };

          Cookies.set("auth_token", token, cookieOptions);
          
          // refresh_token도 함께 저장 (응답에 포함된 경우)
          if (responseData.refresh_token) {
            Cookies.set("refresh_token", responseData.refresh_token, cookieOptions);
          }
          
          // [4단계] 역할 정보도 쿠키에 저장 (권한 체크용)
          // Spring Boot: SecurityContext에 Authentication 저장
          // Next.js: 쿠키에 역할 저장하여 클라이언트에서 권한 체크
          if (userRole) {
            Cookies.set("user_role", userRole, cookieOptions);
          }
        }

        // [5단계] 역할 기반 리다이렉트
        // Spring Boot: AuthenticationSuccessHandler에서 역할에 따라 리다이렉트
        // Next.js: router.push()로 클라이언트 사이드 라우팅
        if (userRole === "ADMIN") {
          // ADMIN은 민원문의처리 페이지로 (대시보드 미구현)
          router.push("/admin/complaints");
        } else {
          // USER 또는 기타 사용자는 민원문의 게시판으로 (외부 JSP 서버)
          const boardUrl = process.env.NEXT_PUBLIC_EGOV_BOARD_URL;
          if (boardUrl) {
            window.location.href = boardUrl;  // 외부 서버이므로 window.location.href 사용
          } else {
            console.error("게시판 주소가 설정되지 않았습니다.");
            router.push("/");
          }
        }
      }
    } catch (error: any) {
      // [에러 처리] Axios 에러 처리
      // Spring Boot: @ExceptionHandler로 서버 사이드 에러 처리
      // Next.js: try-catch로 클라이언트 사이드 에러 처리
      if (error.response) {
        // 서버에서 응답을 받았지만 에러 상태 코드 (400, 401, 500 등)
        const errorData = error.response.data;
        // Laravel API 컨트롤러는 { status: 'error', message: '...' } 형식
        const errorMessage = errorData.message || "아이디 또는 비밀번호가 틀렸습니다.";
        
        // React Hook Form에 에러 설정하여 UI에 표시
        form.setError("password", { message: errorMessage });
      } else {
        // 네트워크 에러 등 (서버 응답 없음)
        console.error("에러:", error);
        form.setError("password", { message: "로그인 중 오류가 발생했습니다." });
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#003366]">
            시스템 로그인
          </CardTitle>
          <CardDescription>아이디와 비밀번호를 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* [레이어 5] 디자인과 로직의 결합 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>아이디</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-[#003366] py-6 text-lg"
              >
                로그인
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm text-center">
          <div className="text-slate-500">
            계정이 없으신가요?{" "}
            <a
              href="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              회원가입
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
