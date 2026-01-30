<?php

/**
 * ============================================
 * [면접 핵심] Laravel API 라우트 정의
 * ============================================
 * 
 * [Spring Boot 비교]
 * Spring Boot:
 *   @RestController
 *   @RequestMapping("/api/auth")
 *   public class AuthController {
 *       @PostMapping("/login")  // 공개 엔드포인트
 *       @PostMapping("/register")  // 공개 엔드포인트
 *       
 *       @GetMapping("/me")  // @PreAuthorize("hasRole('USER')")
 *       @PostMapping("/logout")  // @PreAuthorize("hasRole('USER')")
 *   }
 * 
 * Laravel:
 *   Route::prefix('auth')->group()  // /api/auth 경로 그룹
 *   Route::middleware('auth:api')  // JWT 인증 미들웨어
 * 
 * [라우트 구조]
 * - /api/auth/login (POST) - 공개, 인증 불필요
 * - /api/auth/register (POST) - 공개, 인증 불필요
 * - /api/auth/me (GET) - 인증 필요, JWT 토큰 필수
 * - /api/auth/logout (POST) - 인증 필요, JWT 토큰 필수
 * 
 * [미들웨어 동작 원리]
 * - 'auth:api': JWT 토큰 검증 미들웨어
 *   Spring Boot: @PreAuthorize 또는 SecurityFilterChain 설정
 * - Request Header에 Authorization: Bearer {token} 포함 필요
 * - 토큰이 없거나 유효하지 않으면 401 Unauthorized 반환
 * 
 * [면접 질문 예상]
 * Q: 라우트를 어떻게 보호하나요?
 * A: Route::middleware('auth:api')로 그룹화하여 JWT 인증 필요
 *    Spring Boot: @PreAuthorize("hasRole('USER')") 또는 SecurityConfig에서 설정
 * 
 * Q: 공개 엔드포인트와 보호된 엔드포인트를 어떻게 구분하나요?
 * A: 미들웨어 그룹으로 분리. login/register는 공개, me/logout은 인증 필요
 */

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// [면접 핵심] 인증 관련 API 라우트
// Spring Boot: @RequestMapping("/api/auth")
Route::prefix('auth')->group(function () {
    // [공개 엔드포인트] 인증 불필요 - 누구나 접근 가능
    // Spring Boot: @PostMapping("/login") (인증 없이 접근 가능)
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/refresh', [AuthController::class, 'refresh']);

    // [보호된 엔드포인트] 인증 필요 - JWT 토큰 필수
    // Spring Boot: @PreAuthorize("hasRole('USER')") 또는 SecurityConfig에서 설정
    // [동작 원리]
    // 1. Request Header에서 Authorization: Bearer {token} 추출
    // 2. JWT 토큰 검증 (서명, 만료 시간 등)
    // 3. 토큰에서 user_id 추출하여 User 조회
    // 4. 인증 성공 시 컨트롤러 메서드 실행
    // 5. 인증 실패 시 401 Unauthorized 반환
    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);  // 현재 사용자 정보 조회
        Route::post('/logout', [AuthController::class, 'logout']);  // 로그아웃
    });
});
