/**
 * ============================================
 * [면접 핵심] Next.js 회원가입 페이지
 * ============================================
 * 
 * [Spring Boot 비교]
 * Spring Boot (Backend):
 *   @PostMapping("/api/auth/register")
 *   public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
 *       // 유효성 검사, 비밀번호 암호화, 사용자 생성
 *   }
 * 
 * Next.js (Frontend):
 * - React Hook Form + Zod로 폼 관리 및 유효성 검사
 * - Daum Postcode API로 주소 검색 통합
 * - Axios로 회원가입 API 호출
 * - 성공 시 성공 페이지로 리다이렉트
 * 
 * [핵심 기능]
 * 1. 클라이언트 사이드 유효성 검사 (Zod)
 * 2. 서버 사이드 유효성 검사 (Laravel Validation)
 * 3. 외부 API 통합 (Daum Postcode API)
 * 4. 비밀번호 확인 필드 검증
 * 5. 에러 처리 및 사용자 피드백
 * 
 * [면접 질문 예상]
 * Q: 클라이언트와 서버 양쪽에서 유효성 검사를 하는 이유는?
 * A: 클라이언트: 즉시 피드백으로 UX 향상
 *    서버: 보안 강화 (클라이언트 검증은 우회 가능)
 * 
 * Q: 외부 API(Daum Postcode)를 어떻게 통합하나요?
 * A: Next.js Script 컴포넌트로 동적 로드, window 객체에 타입 정의
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import Script from "next/script";
import axiosInstance from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
 * [면접 핵심] Zod 스키마 - 회원가입 폼 유효성 검사
 * Spring Boot: Bean Validation (@NotBlank, @Email, @Size 등)
 * Next.js: Zod 스키마로 타입 안전한 검증
 * 
 * [특징]
 * - .refine(): 커스텀 검증 로직 (비밀번호 일치 확인)
 * - .or(z.literal("")): 이메일은 선택적 필드 (빈 문자열 허용)
 * - password_confirmation: Laravel의 'confirmed' 규칙과 동일한 역할
 */
const registerSchema = z
  .object({
    username: z.string().min(4, "아이디는 4자 이상입니다."),
    password: z.string().min(4, "비밀번호는 4자 이상입니다."),
    password_confirmation: z.string().min(1, "확인을 위해 다시 입력해주세요."),
    name: z.string().min(1, "이름을 입력해주세요."),
    phone: z.string().min(1, "전화번호를 입력해주세요."),
    email: z.string().email("이메일 형식이 아닙니다.").or(z.literal("")),  // 선택적 필드
    postcode: z.string().optional(),
    address_default: z.string().min(1, "주소를 입력해주세요."),
    address_detail: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["password_confirmation"], // Laravel의 @error('password_confirmation')과 같은 역할
  });

// 다음 우편번호 API 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string; // 우편번호
          roadAddress: string; // 도로명 주소
          jibunAddress: string; // 지번 주소
          userSelectedType: "R" | "J"; // R: 도로명, J: 지번
          bname?: string; // 법정동명
          buildingName?: string; // 건물명
        }) => void;
        onclose?: (state: string) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const detailAddressRef = useRef<HTMLInputElement>(null);
  // 서버와 클라이언트에서 동일한 초기값 유지 (항상 false로 시작)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      password_confirmation: "",
      name: "",
      phone: "",
      email: "",
      postcode: "",
      address_default: "",
      address_detail: "",
    },
  });

  // 주소 검색 핸들러 (클라이언트에서만 실행)
  const handleAddressSearch = () => {
    // 클라이언트에서만 실행되도록 확인
    if (typeof window === "undefined") {
      return;
    }

    // 스크립트 로드 확인
    if (!isScriptLoaded || !window.daum || !window.daum.Postcode) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      new window.daum.Postcode({
        oncomplete: function (data) {
          try {
            // 데이터 유효성 검사
            if (!data) {
              console.error("주소 데이터가 없습니다");
              return;
            }

            const postcode = data.zonecode || "";
            const addr = data.userSelectedType === "R" 
              ? (data.roadAddress || "") 
              : (data.jibunAddress || "");

            // 값 설정 및 검증
            if (postcode) {
              form.setValue("postcode", postcode, { 
                shouldValidate: true,
                shouldDirty: true 
              });
            }

            if (addr) {
              form.setValue("address_default", addr, { 
                shouldValidate: true,
                shouldDirty: true 
              });
            }

            // 상세주소 필드로 포커스 이동
            setTimeout(() => {
              if (detailAddressRef.current) {
                detailAddressRef.current.focus();
              }
            }, 150);

            console.log("주소 설정 완료:", { postcode, addr });
          } catch (error) {
            console.error("주소 설정 오류:", error);
            alert("주소를 설정하는 중 오류가 발생했습니다.");
          }
        },
        onclose: function (state) {
          // 팝업 닫힘 처리 (필요시)
          console.log("팝업 닫힘 상태:", state);
        }
      }).open();
    } catch (error) {
      console.error("주소 검색 팝업 열기 실패:", error);
      alert("주소 검색 팝업을 열 수 없습니다.");
    }
  };

  // 페이지 진입 시 폼 초기화 (뒤로가기 대응) - 클라이언트에서만 실행
  useEffect(() => {
    if (typeof window !== "undefined") {
      form.reset();
    }
  }, []);

  /**
   * [면접 핵심] 회원가입 제출 핸들러
   * Spring Boot: @PostMapping("/register") 메서드와 통신
   * 
   * [처리 흐름]
   * 1. 클라이언트 사이드 유효성 검사 (Zod)
   * 2. Axios로 POST /api/auth/register 요청
   * 3. 서버 사이드 유효성 검사 (Laravel Validation)
   * 4. 성공 시 성공 페이지로 리다이렉트
   * 5. 실패 시 에러 메시지 표시
   */
  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      // [1단계] Laravel API로 전송
      // Spring Boot: RestTemplate.postForEntity() 또는 WebClient.post()
      // Laravel: Route::post('/auth/register', [AuthController::class, 'register'])
      const response = await axiosInstance.post("/auth/register", values);

      console.log("회원가입 응답:", response);
      console.log("응답 상태 코드:", response.status);
      console.log("응답 데이터:", response.data);

      // [2단계] 성공 응답 확인
      // Laravel: HTTP 201 Created 또는 status: 'success'
      // Spring Boot: HTTP 201 Created 또는 ResponseEntity.status(201)
      const isSuccess = 
        response.status === 201 ||  // HTTP 201 Created (리소스 생성 성공)
        response.status === 200 || 
        response.data?.status === 'success';

      if (isSuccess) {
        console.log("회원가입 성공 - 성공 페이지로 이동");
        // [3단계] 성공 페이지로 이동
        // Spring Boot: redirect:/register/success 또는 ResponseEntity로 리다이렉트
        router.push("/register/success");
        // router.push가 작동하지 않는 경우를 대비한 fallback
        if (typeof window !== "undefined") {
          setTimeout(() => {
            if (window.location.pathname !== "/register/success") {
              window.location.href = "/register/success";
            }
          }, 100);
        }
      } else {
        console.warn("예상치 못한 응답:", {
          status: response.status,
          data: response.data
        });
        alert("회원가입 처리 중 문제가 발생했습니다.");
      }
    } catch (error: any) {
      console.error("회원가입 에러:", error);
      console.error("에러 응답:", error.response);
      
      // [에러 처리] Laravel Validation 에러 처리
      // Spring Boot: @ExceptionHandler(MethodArgumentNotValidException.class)
      // Laravel: HTTP 422 Unprocessable Entity + errors 객체
      if (error.response?.status === 422 && error.response?.data?.errors) {
        // Laravel Validation 에러 형식: { errors: { field: ["메시지"] } }
        // Spring Boot: BindingResult.getFieldErrors()와 유사
        const serverErrors = error.response.data.errors;
        Object.keys(serverErrors).forEach((key) => {
          form.setError(key as any, { 
            message: serverErrors[key][0]  // 첫 번째 에러 메시지만 표시
          });
        });
      } 
      // 일반 에러 메시지 처리
      else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } 
      // 네트워크 에러 등
      else {
        alert("가입 중 에러가 발생했습니다. 네트워크를 확인해주세요.");
      }
    }
  }

  return (
    <>
      {/* 다음 우편번호 API 스크립트 로드 */}
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
        onLoad={() => {
          setIsScriptLoaded(true);
          console.log("다음 우편번호 API 로드 완료");
        }}
        onError={() => {
          console.error("다음 우편번호 API 로드 실패");
        }}
      />

      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <Card className="w-full max-w-2xl shadow-lg border-slate-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#003366]">
            회원가입
          </CardTitle>
          <CardDescription>
            전자정부 통합 시스템 회원가입을 환영합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 확인</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="성함을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호</FormLabel>
                    <FormControl>
                      <Input placeholder="010-0000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@mail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-4 gap-2 items-end">
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>우편번호</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="col-span-1"
                  onClick={handleAddressSearch}
                  disabled={!isScriptLoaded}
                  suppressHydrationWarning
                >
                  주소찾기
                </Button>
              </div>
              <FormField
                control={form.control}
                name="address_default"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>기본주소</FormLabel>
                    <FormControl>
                      <Input placeholder="기본주소" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_detail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상세주소</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="상세주소를 입력하세요" 
                        {...field}
                        ref={(e) => {
                          field.ref(e);
                          detailAddressRef.current = e;
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-[#003366] hover:bg-[#002244] py-6 text-lg mt-6"
              >
                회원가입 완료
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
