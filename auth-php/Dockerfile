# ============================================
# Laravel (auth-php) - Multi-stage, 프로덕션만 포함해 이미지 최소화
# ============================================

# Stage 1: Vite 빌드 (프론트 에셋만 생성)
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json* vite.config.js ./
COPY resources ./resources
COPY public ./public
RUN npm ci && npm run build

# Stage 2: PHP 프로덕션 이미지 (CLI로 artisan serve - 단일 컨테이너에서 HTTP 제공)
FROM php:8.2-cli-alpine

# Laravel에 필요한 PHP 확장 (최소 세트)
RUN apk add --no-cache \
    libpq-dev \
    icu-dev \
    libxml2-dev \
    oniguruma-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) \
    pdo_pgsql \
    mbstring \
    xml \
    intl \
    opcache

# Composer 설치 (최소)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 앱 복사
COPY . .

# Stage 1에서 빌드된 프론트 에셋만 복사
COPY --from=frontend /app/public/build ./public/build

# 프로덕션 의존성만 설치 (dev 제외, autoload 최적화)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts \
    && composer run-script post-autoload-dump --no-interaction || true

# .env 제거 → 런타임에 Docker environment만 사용 (DB_HOST=postgres 등)
RUN rm -f .env

# 권한 및 캐시 (config:cache 제외 - 런타임에 Docker env 사용)
RUN chmod -R 755 storage bootstrap/cache \
    && php artisan route:cache 2>/dev/null || true

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
