@echo off
REM ============================================
REM [배포 스크립트] Laravel 프로덕션 배포 (Windows)
REM ============================================
REM 
REM [실행 순서]
REM 1. 의존성 설치 (composer install --optimize-autoloader --no-dev)
REM 2. 환경 변수 설정 (.env 파일 확인)
REM 3. 애플리케이션 키 생성 (php artisan key:generate)
REM 4. JWT 시크릿 키 생성 (php artisan jwt:secret)
REM 5. 데이터베이스 마이그레이션 (php artisan migrate --force)
REM 6. 캐시 최적화 (config:cache, route:cache, view:cache)
REM 7. 스토리지 링크 (php artisan storage:link)
REM 
REM [성능 최적화]
REM - config:cache: 설정 파일 캐싱 (약 0.1초 단축)
REM - route:cache: 라우트 캐싱 (약 0.1초 단축)
REM - view:cache: 뷰 컴파일 캐싱 (약 0.1초 단축)

echo ============================================
echo Laravel 프로덕션 배포 시작
echo ============================================
echo.

REM 1. 의존성 설치 (프로덕션 최적화)
echo [1/7] Composer 의존성 설치 중...
call composer install --optimize-autoloader --no-dev --no-interaction
if %errorlevel% neq 0 (
    echo 오류: Composer 설치 실패
    exit /b 1
)

REM 2. 환경 변수 확인
echo [2/7] 환경 변수 확인 중...
if not exist .env (
    echo 경고: .env 파일이 없습니다. .env.example을 복사하여 생성하세요.
    exit /b 1
)

REM 3. 애플리케이션 키 생성 (없는 경우)
echo [3/7] 애플리케이션 키 확인 중...
call php artisan key:generate --force

REM 4. JWT 시크릿 키 생성 (없는 경우)
echo [4/7] JWT 시크릿 키 확인 중...
call php artisan jwt:secret --force

REM 5. 데이터베이스 마이그레이션
echo [5/7] 데이터베이스 마이그레이션 실행 중...
call php artisan migrate --force

REM 6. 캐시 최적화 (성능 개선)
echo [6/7] 캐시 최적화 중...
echo   - 설정 파일 캐싱 (config:cache)...
call php artisan config:cache
echo   - 라우트 캐싱 (route:cache)...
call php artisan route:cache
echo   - 뷰 컴파일 캐싱 (view:cache)...
call php artisan view:cache

REM 7. 스토리지 링크
echo [7/7] 스토리지 링크 생성 중...
call php artisan storage:link

echo ============================================
echo 배포 완료!
echo ============================================
echo.
echo 다음 명령어로 캐시를 초기화할 수 있습니다:
echo   php artisan config:clear
echo   php artisan route:clear
echo   php artisan view:clear
echo.

pause
