/**
 * ============================================
 * [면접 핵심] Axios HTTP 클라이언트 설정 - 전역 인터셉터 포함
 * ============================================
 *
 * [Spring Boot 비교]
 * Spring Boot (Backend):
 *   @RestController
 *   @CrossOrigin(origins = "http://localhost:3000")
 *   public class AuthController { ... }
 *
 * Next.js (Frontend):
 *   axios.create({ baseURL: "http://localhost:8000/api" })
 *   + 인터셉터로 401 에러 처리 및 토큰 갱신
 *
 * [핵심 기능]
 * 1. 요청 인터셉터: JWT 토큰 자동 포함
 * 2. 응답 인터셉터: 401 에러 감지 → refresh token으로 갱신 → 원래 요청 재시도
 *
 * [면접 질문 예상]
 * Q: 토큰 만료 시 어떻게 처리하나요?
 * A: 401 에러 발생 시 refresh token으로 새 토큰 발급 후 원래 요청 재시도
 *    Spring Boot: FilterChain에서 토큰 갱신 처리
 *
 * Q: 무한 재시도 루프를 어떻게 방지하나요?
 * A: refresh 요청 자체가 실패하면 재시도하지 않고 로그인 페이지로 리다이렉트
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// [면접 핵심] Axios 인스턴스 생성
// Spring Boot: RestTemplate 또는 WebClient 빈 설정
// Next.js: axios.create()로 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// [면접 핵심] 요청 인터셉터: JWT 토큰 자동 포함
// Spring Boot: Filter에서 Authorization 헤더 추가
// Next.js: axios.interceptors.request.use()로 요청 전에 토큰 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// [면접 핵심] 응답 인터셉터: 401 에러 처리 및 토큰 갱신
// Spring Boot: FilterChain에서 토큰 검증 실패 시 처리
// Next.js: axios.interceptors.response.use()로 응답 후 에러 처리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // [1단계] 401 Unauthorized 에러인지 확인
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // [2단계] 이미 refresh 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // [3단계] refresh_token으로 새 토큰 발급
      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        // refresh_token이 없으면 로그인 페이지로 리다이렉트
        processQueue(error, null);
        isRefreshing = false;
        if (typeof window !== "undefined") {
          const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
          window.location.href = loginUrl;
        }
        return Promise.reject(error);
      }

      try {
        // [4단계] /auth/refresh 엔드포인트로 토큰 갱신 요청
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        // [5단계] 새 토큰 저장
        if (response.data?.data?.token) {
          const newToken = response.data.data.token;
          const newRefreshToken = response.data.data.refresh_token;

          // 쿠키 보안 설정 (환경 변수 사용)
          const cookieOptions = {
            expires: 1, // 1일
            path: process.env.NEXT_PUBLIC_COOKIE_PATH || "/",
            sameSite:
              (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE as
                | "strict"
                | "lax"
                | "none") || "lax",
            secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
          };

          Cookies.set("auth_token", newToken, cookieOptions);
          if (newRefreshToken) {
            Cookies.set("refresh_token", newRefreshToken, cookieOptions);
          }

          // [6단계] 대기 중인 요청들에 새 토큰 전달
          processQueue(null, newToken);

          // [7단계] 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          throw new Error("토큰 갱신 응답에 토큰이 없습니다.");
        }
      } catch (refreshError) {
        // [8단계] refresh 실패 시 로그인 페이지로 리다이렉트
        processQueue(refreshError as AxiosError, null);
        Cookies.remove("auth_token");
        Cookies.remove("refresh_token");
        Cookies.remove("user_role");

        if (typeof window !== "undefined") {
          const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
          window.location.href = loginUrl;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 401이 아닌 다른 에러는 그대로 반환
    return Promise.reject(error);
  },
);

export default axiosInstance;
