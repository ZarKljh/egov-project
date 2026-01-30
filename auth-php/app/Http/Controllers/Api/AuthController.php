<?php

/**
 * ============================================
 * [면접 핵심] Laravel API 컨트롤러 - 인증 처리
 * ============================================
 * 
 * [Spring Boot 비교]
 * Spring Boot: @RestController + @RequestMapping("/api/auth")
 * Laravel: Controller extends Controller + Route::prefix('auth')
 * 
 * [핵심 개념]
 * 1. RESTful API 설계: POST /api/auth/login, POST /api/auth/register
 * 2. JWT 인증: Tymon\JWTAuth (Spring Boot의 JWT 라이브러리와 유사)
 * 3. 비밀번호 암호화: Hash::make() = BCrypt (Spring Security의 PasswordEncoder와 동일)
 * 4. 유효성 검사: $request->validate() (Spring의 @Valid + BindingResult와 유사)
 * 5. 일관된 응답 형식: jsonResponse() 메서드로 통일 (Spring의 ResponseEntity와 유사)
 * 
 * [면접 질문 예상]
 * Q: JWT 토큰을 어떻게 생성하고 검증하나요?
 * A: JWTAuth::fromUser($user)로 토큰 생성, parseToken()->authenticate()로 검증
 *    Spring Boot에서는 Jwts.builder()로 생성, Jwts.parser()로 검증
 * 
 * Q: 비밀번호를 어떻게 안전하게 저장하나요?
 * A: Hash::make()로 BCrypt 해시화하여 저장. 검증은 Hash::check() 사용
 *    Spring Boot에서는 BCryptPasswordEncoder.encode()와 matches() 사용
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * [면접 핵심] 일관된 JSON 응답 형식 반환
     * 
     * [Spring Boot 비교]
     * Spring Boot: ResponseEntity<ApiResponse<T>>
     *   return ResponseEntity.ok(new ApiResponse("success", "메시지", data));
     * 
     * Laravel: response()->json()
     *   return response()->json(['status' => 'success', 'message' => '...', 'data' => ...], 200);
     * 
     * [설계 패턴]
     * - 모든 API 응답을 동일한 형식으로 통일하여 프론트엔드에서 일관되게 처리
     * - HTTP 상태 코드와 함께 status 필드로 비즈니스 로직 성공/실패 구분
     *
     * @param string $status 'success' | 'error'
     * @param string $message 사용자에게 보여줄 메시지
     * @param mixed $data 응답 데이터 (null 가능)
     * @param int $statusCode HTTP 상태 코드 (200, 201, 401, 404, 500 등)
     * @return \Illuminate\Http\JsonResponse
     */
    private function jsonResponse($status, $message, $data = null, $statusCode = 200)
    {
        $response = [
            'status' => $status,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * [면접 핵심] 로그인 처리 및 JWT 토큰 발급
     * 
     * [Spring Boot 비교]
     * Spring Boot:
     *   @PostMapping("/login")
     *   public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
     *       User user = userService.findByUsername(request.getUsername());
     *       if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
     *           return ResponseEntity.status(401).body(new ApiResponse("error", "로그인 실패"));
     *       }
     *       String token = jwtTokenProvider.generateToken(user);
     *       return ResponseEntity.ok(new ApiResponse("success", "로그인 성공", token));
     *   }
     * 
     * [핵심 로직 흐름]
     * 1. 입력 유효성 검사 (Validation)
     * 2. 사용자 조회 (Database Query)
     * 3. 비밀번호 검증 (BCrypt Hash Check)
     * 4. JWT 토큰 생성
     * 5. 성공 응답 반환
     * 
     * [보안 고려사항]
     * - 비밀번호는 평문으로 저장하지 않고 BCrypt 해시로 저장
     * - JWT 토큰에 민감 정보(비밀번호) 포함하지 않음
     * - 사용자 정보는 최소한만 반환 (비밀번호 제외)
     * 
     * [면접 질문 예상]
     * Q: 비밀번호 검증은 어떻게 하나요?
     * A: Hash::check(입력비밀번호, DB해시)로 검증. BCrypt는 단방향 해시이므로
     *    평문을 해시화해서 비교하는 것이 아니라, 내부적으로 salt를 사용해 검증
     * 
     * Q: JWT 토큰에 어떤 정보를 담나요?
     * A: User 모델의 getJWTIdentifier()와 getJWTCustomClaims()에서 정의한 정보
     *    (user_id, username, role) - Spring Boot의 JWT Claims와 동일한 개념
     *
     * @param Request $request { username: string, password: string }
     * @return \Illuminate\Http\JsonResponse { status, message, data: { token, user } }
     */
    public function login(Request $request)
    {
        // [1단계] 유효성 검사 - Spring Boot의 @Valid와 동일한 역할
        // Spring Boot: @Valid @RequestBody LoginRequest (Bean Validation)
        // Laravel: $request->validate() (Laravel Validation Rules)
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50'],
            'password' => ['required', 'string'],
        ]);

        // [2단계] 사용자 조회 (성능 최적화: 필요한 컬럼만 선택)
        // Spring Boot: userRepository.findByUsername(username)
        // Laravel: User::select(...)->where(...)->first()
        // [성능 팁] select()로 필요한 컬럼만 가져와서 메모리 절약
        $user = User::select('user_id', 'username', 'password', 'name', 'role', 'refresh_token')
            ->where('username', $validated['username'])
            ->first();

        // [3단계] 사용자 존재 및 비밀번호 확인 (BCrypt 검증)
        // Spring Boot: passwordEncoder.matches(rawPassword, encodedPassword)
        // Laravel: Hash::check(plainPassword, hashedPassword)
        // [보안] BCrypt는 단방향 해시이므로 복호화 불가능, 검증만 가능
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return $this->jsonResponse(
                'error',
                '아이디 또는 비밀번호가 올바르지 않습니다.',
                null,
                401  // HTTP 401 Unauthorized
            );
        }

        // [4단계] JWT 토큰 생성
        // Spring Boot: jwtTokenProvider.generateToken(user)
        // Laravel: JWTAuth::fromUser($user)
        // [동작 원리] User 모델의 getJWTIdentifier()와 getJWTCustomClaims() 호출하여 토큰 생성
        try {
            $accessToken = JWTAuth::fromUser($user);
            $refreshToken = bin2hex(random_bytes(40));
            $user->update([
                'refresh_token' => $refreshToken
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse(
                'error',
                '토큰 생성 중 오류가 발생했습니다.',
                null,
                500  // HTTP 500 Internal Server Error
            );
        }

        // [5단계] 성공 응답 (필요한 최소한의 사용자 정보만 반환)
        // [보안] 비밀번호는 절대 응답에 포함하지 않음
        return $this->jsonResponse('success', '로그인 성공', [
            'token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',  // OAuth 2.0 표준 형식
            'expires_in' => config('jwt.ttl') * 60, // 초 단위 (config/jwt.php에서 설정)
            'user' => [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,  // 권한 정보 (ADMIN/USER)
            ],
        ]);
    }

    /**
     * [면접 핵심] 회원가입 처리
     * 
     * [Spring Boot 비교]
     * Spring Boot:
     *   @PostMapping("/register")
     *   public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
     *       if (userRepository.existsByUsername(request.getUsername())) {
     *           return ResponseEntity.badRequest().body(new ApiResponse("error", "중복된 아이디"));
     *       }
     *       User user = new User();
     *       user.setPassword(passwordEncoder.encode(request.getPassword()));
     *       userRepository.save(user);
     *       return ResponseEntity.status(201).body(new ApiResponse("success", "가입 완료"));
     *   }
     * 
     * [핵심 로직]
     * 1. 입력 유효성 검사 (unique 체크 포함)
     * 2. 비밀번호 BCrypt 해시화
     * 3. 사용자 생성 (Eloquent ORM)
     * 4. 성공 응답 (201 Created)
     * 
     * [유효성 검사 규칙 설명]
     * - 'unique:site_user,username': DB에서 username 중복 체크
     *   Spring Boot: @UniqueUsername 같은 커스텀 어노테이션 또는 수동 체크
     * - 'confirmed': password_confirmation 필드와 일치 여부 확인
     *   Spring Boot: @PasswordMatches 같은 커스텀 검증 또는 수동 체크
     * - 'nullable': 선택적 필드 (null 허용)
     * 
     * [면접 질문 예상]
     * Q: unique 검증은 어떻게 동작하나요?
     * A: Laravel이 DB 쿼리를 실행하여 중복 여부 확인. 
     *    Spring Boot에서는 Repository.existsByUsername() 메서드로 수동 체크
     * 
     * Q: 비밀번호를 어떻게 암호화하나요?
     * A: Hash::make()로 BCrypt 해시 생성. Spring Boot의 BCryptPasswordEncoder.encode()와 동일
     *
     * @param Request $request 회원가입 정보
     * @return \Illuminate\Http\JsonResponse HTTP 201 Created
     */
    public function register(Request $request)
    {
        // [1단계] 유효성 검사
        // Spring Boot: @Valid + Bean Validation 어노테이션
        // Laravel: $request->validate() + Validation Rules
        // [특징] 'unique:site_user,username' - DB 레벨에서 중복 체크
        //        'confirmed' - password_confirmation 필드와 일치 여부 확인
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', 'unique:site_user,username'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],  // password_confirmation과 일치해야 함
            'name' => ['required', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:100'],  // nullable: 선택적 필드
            'postcode' => ['nullable', 'string', 'max:20'],
            'address_default' => ['nullable', 'string', 'max:100'],
            'address_detail' => ['nullable', 'string', 'max:100'],
        ]);

        // [2단계] 회원가입 처리 (BCrypt 비밀번호 암호화)
        // Spring Boot: user.setPassword(passwordEncoder.encode(password)); userRepository.save(user);
        // Laravel: User::create() - Eloquent ORM의 Mass Assignment 사용
        // [보안] Hash::make()로 BCrypt 해시 생성 (단방향 암호화, 복호화 불가능)
        $user = User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']), // BCrypt 암호화
            'name' => $validated['name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'postcode' => $validated['postcode'] ?? null,
            'address_default' => $validated['address_default'] ?? null,
            'address_detail' => $validated['address_detail'] ?? null,
            'role' => 'USER', // 기본값으로 USER 설정 (ADMIN은 별도 관리)
        ]);

        // [3단계] 성공 응답 (필요한 최소한의 사용자 정보만 반환)
        // HTTP 201 Created - 리소스 생성 성공을 나타내는 표준 상태 코드
        // Spring Boot: ResponseEntity.status(201).body(...)
        return $this->jsonResponse('success', '회원가입이 완료되었습니다.', [
            'user' => [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
            ],
        ], 201);  // HTTP 201 Created
    }

    /**
     * [면접 핵심] 현재 로그인한 사용자 정보 조회
     * 
     * [Spring Boot 비교]
     * Spring Boot:
     *   @GetMapping("/me")
     *   @PreAuthorize("hasRole('USER')")  // 인증 필요
     *   public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
     *       User user = userService.findById(userDetails.getId());
     *       return ResponseEntity.ok(new ApiResponse("success", "조회 성공", user));
     *   }
     * 
     * [인증 흐름]
     * 1. Request Header에서 JWT 토큰 추출 (Authorization: Bearer {token})
     * 2. 토큰 파싱 및 검증 (서명, 만료 시간 등)
     * 3. 토큰에서 user_id 추출
     * 4. DB에서 사용자 조회
     * 5. 사용자 정보 반환
     * 
     * [JWT 토큰 예외 처리]
     * - TokenExpiredException: 토큰 만료 (재로그인 필요)
     * - TokenInvalidException: 토큰 서명 오류 또는 변조
     * - JWTException: 토큰이 없거나 형식 오류
     * 
     * [면접 질문 예상]
     * Q: JWT 토큰은 어떻게 검증하나요?
     * A: parseToken()->authenticate()로 검증. 내부적으로:
     *    1) 토큰 서명 검증 (secret key로 서명 확인)
     *    2) 만료 시간 확인 (exp claim)
     *    3) 토큰에서 user_id 추출하여 DB 조회
     *    Spring Boot: Jwts.parser().setSigningKey(secret).parseClaimsJws(token)
     * 
     * Q: 토큰이 만료되면 어떻게 하나요?
     * A: 클라이언트에 401 응답 반환, 프론트엔드에서 로그인 페이지로 리다이렉트
     *    또는 Refresh Token을 사용하여 새 Access Token 발급 (이 프로젝트에서는 미구현)
     *
     * @param Request $request Authorization 헤더에 JWT 토큰 포함
     * @return \Illuminate\Http\JsonResponse 사용자 정보 또는 에러 메시지
     */
    public function me(Request $request)
    {
        try {
            // [핵심] JWT 토큰에서 사용자 정보 가져오기
            // Spring Boot: @AuthenticationPrincipal UserDetails 또는 SecurityContext에서 추출
            // Laravel: JWTAuth::parseToken()->authenticate()
            // [동작 원리]
            // 1. Request Header의 Authorization: Bearer {token}에서 토큰 추출
            // 2. 토큰 서명 검증 (config/jwt.php의 secret key 사용)
            // 3. 토큰의 'sub' claim에서 user_id 추출
            // 4. User::find(user_id)로 DB에서 사용자 조회
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return $this->jsonResponse(
                    'error',
                    '사용자를 찾을 수 없습니다.',
                    null,
                    404  // HTTP 404 Not Found
                );
            }

            // 성공 응답 (필요한 최소한의 사용자 정보만 반환, 비밀번호 제외)
            return $this->jsonResponse('success', '사용자 정보 조회 성공', [
                'user' => [
                    'user_id' => $user->user_id,
                    'username' => $user->username,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'postcode' => $user->postcode,
                    'address_default' => $user->address_default,
                    'address_detail' => $user->address_detail,
                    'role' => $user->role,
                ],
            ]);
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            // [예외 처리] 토큰 만료
            // Spring Boot: ExpiredJwtException
            return $this->jsonResponse(
                'error',
                '토큰이 만료되었습니다.',
                null,
                401  // HTTP 401 Unauthorized
            );
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            // [예외 처리] 토큰 서명 오류 또는 변조
            // Spring Boot: SignatureException, MalformedJwtException
            return $this->jsonResponse(
                'error',
                '유효하지 않은 토큰입니다.',
                null,
                401
            );
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            // [예외 처리] 토큰이 없거나 형식 오류
            // Spring Boot: IllegalArgumentException
            return $this->jsonResponse(
                'error',
                '토큰이 제공되지 않았습니다.',
                null,
                401
            );
        }
    }

    /**
     * [면접 핵심] 토큰 갱신 API
     * Access Token이 만료되었을 때, Refresh Token을 사용하여 새 토큰을 발급합니다.
     * 
     * [Spring Boot 비교]
     * Spring Boot:
     *   @PostMapping("/refresh")
     *   public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
     *       User user = userService.findByRefreshToken(request.getRefreshToken());
     *       if (user == null) {
     *           return ResponseEntity.status(401).body(new ApiResponse("error", "Invalid refresh token"));
     *       }
     *       String newToken = jwtTokenProvider.generateToken(user);
     *       return ResponseEntity.ok(new ApiResponse("success", "Token refreshed", newToken));
     *   }
     * 
     * [핵심 로직]
     * 1. Refresh Token 유효성 검사
     * 2. 사용자 조회 (필요한 필드 포함)
     * 3. 새로운 Access Token 생성
     * 4. Refresh Token 갱신 (Token Rotation)
     * 
     * [보안 고려사항]
     * - Refresh Token Rotation: 매번 새로운 Refresh Token 발급하여 이전 토큰 무효화
     * - JWT 토큰 생성 시 필요한 필드(username, role)를 반드시 포함하여 조회
     * 
     * [면접 질문 예상]
     * Q: Refresh Token을 왜 매번 갱신하나요?
     * A: Token Rotation으로 보안 강화. 토큰 탈취 시에도 다음 갱신 시 무효화됨
     */
    public function refresh(Request $request)
    {
        // [1단계] Refresh Token 추출 및 유효성 검사
        $refreshToken = $request->input('refresh_token');

        if (!$refreshToken) {
            return $this->jsonResponse(
                'error',
                'Refresh token이 필요합니다.',
                null,
                400  // HTTP 400 Bad Request
            );
        }

        // [2단계] Refresh Token으로 사용자 조회
        // [중요] JWT 토큰 생성에 필요한 필드들을 반드시 포함
        // User 모델의 getJWTCustomClaims()에서 $this->username, $this->role 사용
        $user = User::select('user_id', 'username', 'role', 'refresh_token')
            ->where('refresh_token', $refreshToken)
            ->first();

        if (!$user) {
            return $this->jsonResponse(
                'error',
                '유효하지 않은 Refresh Token입니다. 다시 로그인해주세요.',
                null,
                401  // HTTP 401 Unauthorized
            );
        }

        try {
            // [3단계] 새로운 Access Token 생성
            // [핵심] JWTAuth::fromUser($user)는 User 모델의 다음 메서드들을 호출:
            // - getJWTIdentifier(): user_id 반환 (토큰의 'sub' claim에 저장)
            // - getJWTCustomClaims(): username, role 반환 (커스텀 claims에 저장)
            $newAccessToken = JWTAuth::fromUser($user);

            // [4단계] Refresh Token Rotation (보안 강화)
            // 매번 새로운 Refresh Token 발급하여 이전 토큰 무효화
            $newRefreshToken = bin2hex(random_bytes(40)); // 80자 랜덤 문자열
            $user->update(['refresh_token' => $newRefreshToken]);

            // [5단계] 성공 응답
            return $this->jsonResponse('success', '토큰이 갱신되었습니다.', [
                'token' => $newAccessToken,
                'refresh_token' => $newRefreshToken,
                'token_type' => 'bearer',  // OAuth 2.0 표준 형식
                'expires_in' => config('jwt.ttl') * 60, // 초 단위
            ]);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            // [예외 처리] JWT 토큰 생성 실패
            // 예: JWT_SECRET이 설정되지 않음, User 모델의 필수 필드 누락 등
            return $this->jsonResponse(
                'error',
                '토큰 생성 중 오류가 발생했습니다: ' . $e->getMessage(),
                null,
                500  // HTTP 500 Internal Server Error
            );
        } catch (\Exception $e) {
            // [예외 처리] 기타 예외 (DB 오류 등)
            return $this->jsonResponse(
                'error',
                '토큰 갱신에 실패했습니다.',
                null,
                500
            );
        }
    }

    /**
     * [면접 핵심] 로그아웃 처리
     * 
     * [Spring Boot 비교]
     * Spring Boot:
     *   @PostMapping("/logout")
     *   public ResponseEntity<?> logout(HttpServletRequest request) {
     *       String token = jwtTokenProvider.resolveToken(request);
     *       jwtTokenProvider.invalidateToken(token);  // Redis에 블랙리스트 추가
     *       return ResponseEntity.ok(new ApiResponse("success", "로그아웃 완료"));
     *   }
     * 
     * [JWT 로그아웃의 한계]
     * - JWT는 Stateless이므로 서버에서 토큰을 무효화하기 어려움
     * - 일반적으로는 클라이언트에서 토큰 삭제만으로 처리
     * - 완전한 로그아웃을 위해서는 Redis 등에 블랙리스트 저장 필요 (이 프로젝트에서는 미구현)
     * 
     * [면접 질문 예상]
     * Q: JWT는 Stateless인데 로그아웃을 어떻게 처리하나요?
     * A: 두 가지 방법:
     *    1) 클라이언트에서 토큰 삭제 (간단하지만 보안 취약)
     *    2) Redis에 블랙리스트 저장하여 검증 시 체크 (완전한 로그아웃)
     *    이 프로젝트는 1번 방식 사용
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
             // [1단계] 현재 로그인한 사용자 정보 가져오기
            // Access Token에서 user_id 추출
            $user = JWTAuth::parseToken()->authenticate();
            
            if ($user) {
                // [2단계] DB에서 Refresh Token 삭제 (NULL로 설정)
                // Spring Boot: userRepository.updateRefreshToken(userId, null)
                // Laravel: $user->update(['refresh_token' => null])
                $user->update(['refresh_token' => null]);
            }

            // [3단계] Access Token 무효화 시도
            // Redis 등이 설정되어 있지 않으면 실제로는 동작하지 않지만,
            // 설정되어 있으면 블랙리스트에 추가됨
            JWTAuth::parseToken()->invalidate();

            return $this->jsonResponse('success', '로그아웃되었습니다.');
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            try {
                 // 토큰에서 user_id 추출 시도
                $payload = JWTAuth::parseToken()->getPayload();
                $userId = $payload->get('sub');
                
                User::where('user_id', $userId)->update(['refresh_token' => null]);
            } catch (\Exception $ex){

            }
            return $this->jsonResponse('success', '로그아웃되었습니다.');
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            // 토큰이 없거나 유효하지 않은 경우
            // Refresh Token 삭제는 불가능하지만, 로그아웃은 성공으로 처리
            return $this->jsonResponse('success', '로그아웃되었습니다.');
        }
    }
}
