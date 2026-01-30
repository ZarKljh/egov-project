/**
 * Spring Boot API용 Axios 인스턴스
 *
 * [특징]
 * - Spring Boot는 쿠키에서 JWT 토큰을 읽음 (JwtUtil.resolveToken)
 * - withCredentials: true로 쿠키 자동 전송
 * - baseURL: 환경 변수에서 읽어옴 (NEXT_PUBLIC_SPRINGBOOT_API_URL)
 *
 * [환경 변수 설정]
 * .env.local 파일에 NEXT_PUBLIC_SPRINGBOOT_API_URL=http://localhost:8080 추가 필요
 */

import axios, { AxiosError } from "axios";

// 환경 변수에서 Spring Boot API URL 가져오기
const springBootApiUrl = process.env.NEXT_PUBLIC_SPRINGBOOT_API_URL;

if (!springBootApiUrl) {
  throw new Error(
    "NEXT_PUBLIC_SPRINGBOOT_API_URL 환경 변수가 설정되지 않았습니다. " +
      ".env.local 파일에 NEXT_PUBLIC_SPRINGBOOT_API_URL=http://localhost:8080 을 추가해주세요.",
  );
}

const springBootAxios = axios.create({
  baseURL: springBootApiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // 쿠키 자동 전송 (JWT 토큰이 쿠키에 있음)
});

// 에러 처리 인터셉터
springBootAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default springBootAxios;
