#!/bin/bash

/**
 * ============================================
 * [배포 스크립트] Laravel 프로덕션 배포
 * ============================================
 * 
 * [실행 순서]
 * 1. 의존성 설치 (composer install --optimize-autoloader --no-dev)
 * 2. 환경 변수 설정 (.env 파일 확인)
 * 3. 애플리케이션 키 생성 (php artisan key:generate)
 * 4. JWT 시크릿 키 생성 (php artisan jwt:secret)
 * 5. 데이터베이스 마이그레이션 (php artisan migrate --force)
 * 6. 캐시 최적화 (config:cache, route:cache, view:cache)
 * 7. 스토리지 링크 (php artisan storage:link)
 * 8. 권한 설정 (storage, bootstrap/cache 디렉토리)
 * 
 * [성능 최적화]
 * - config:cache: 설정 파일 캐싱 (약 0.1초 단축)
 * - route:cache: 라우트 캐싱 (약 0.1초 단축)
 * - view:cache: 뷰 컴파일 캐싱 (약 0.1초 단축)
 * 
 * [주의사항]
 * - 프로덕션 환경에서만 실행
 * - 개발 환경에서는 php artisan config:clear, route:clear, view:clear 사용
 */

set -e  # 에러 발생 시 스크립트 중단

echo "============================================"
echo "Laravel 프로덕션 배포 시작"
echo "============================================"

# 1. 의존성 설치 (프로덕션 최적화)
echo "[1/8] Composer 의존성 설치 중..."
composer install --optimize-autoloader --no-dev --no-interaction

# 2. 환경 변수 확인
echo "[2/8] 환경 변수 확인 중..."
if [ ! -f .env ]; then
    echo "경고: .env 파일이 없습니다. .env.example을 복사하여 생성하세요."
    exit 1
fi

# 3. 애플리케이션 키 생성 (없는 경우)
echo "[3/8] 애플리케이션 키 확인 중..."
php artisan key:generate --force

# 4. JWT 시크릿 키 생성 (없는 경우)
echo "[4/8] JWT 시크릿 키 확인 중..."
php artisan jwt:secret --force

# 5. 데이터베이스 마이그레이션
echo "[5/8] 데이터베이스 마이그레이션 실행 중..."
php artisan migrate --force

# 6. 캐시 최적화 (성능 개선)
echo "[6/8] 캐시 최적화 중..."
echo "  - 설정 파일 캐싱 (config:cache)..."
php artisan config:cache
echo "  - 라우트 캐싱 (route:cache)..."
php artisan route:cache
echo "  - 뷰 컴파일 캐싱 (view:cache)..."
php artisan view:cache

# 7. 스토리지 링크
echo "[7/8] 스토리지 링크 생성 중..."
php artisan storage:link || true  # 이미 존재하면 무시

# 8. 권한 설정
echo "[8/8] 디렉토리 권한 설정 중..."
chmod -R 775 storage bootstrap/cache || true
chown -R www-data:www-data storage bootstrap/cache || true

echo "============================================"
echo "배포 완료!"
echo "============================================"
echo ""
echo "다음 명령어로 캐시를 초기화할 수 있습니다:"
echo "  php artisan config:clear"
echo "  php artisan route:clear"
echo "  php artisan view:clear"
echo ""
