<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
    | CORS 허용 Origin (쉼표 구분). 배포 시 .env 에 FRONTEND_URL 또는 CORS_ALLOWED_ORIGINS 설정
    | 예: CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
    */
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
    ],

    'exposed_headers' => [
        'Authorization',
    ],

    'max_age' => 86400, // 24시간 (초 단위)

    'supports_credentials' => false, // JWT 토큰 사용 시 false 유지

];
