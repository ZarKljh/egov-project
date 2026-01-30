<?php

/**
 * ============================================
 * [성능 최적화] site_user 테이블 인덱스 추가
 * ============================================
 * 
 * [목적]
 * - username 컬럼 인덱스: 로그인 시 WHERE username = ? 쿼리 성능 향상
 * - refresh_token 컬럼 인덱스: 토큰 갱신 시 WHERE refresh_token = ? 쿼리 성능 향상
 * 
 * [성능 효과]
 * - 인덱스 없음: Full Table Scan (O(n))
 * - 인덱스 있음: Index Scan (O(log n))
 * - 예상 성능 개선: 0.5초 → 0.1초 이하
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * [인덱스 추가]
     * - idx_site_user_username: username 컬럼 인덱스 (로그인 쿼리 최적화)
     * - idx_site_user_refresh_token: refresh_token 컬럼 인덱스 (토큰 갱신 쿼리 최적화)
     */
    public function up(): void
    {
        Schema::table('site_user', function (Blueprint $table) {
            // [성능 최적화] username 컬럼 인덱스 추가
            // 로그인 시 WHERE username = ? 쿼리 성능 향상
            // AuthController::login()에서 사용
            $table->index('username', 'idx_site_user_username');
            
            // [성능 최적화] refresh_token 컬럼 인덱스 추가
            // 토큰 갱신 시 WHERE refresh_token = ? 쿼리 성능 향상
            // AuthController::refresh()에서 사용
            $table->index('refresh_token', 'idx_site_user_refresh_token');
        });
    }

    /**
     * Reverse the migrations.
     * 
     * [인덱스 제거]
     * - 마이그레이션 롤백 시 인덱스 제거
     */
    public function down(): void
    {
        Schema::table('site_user', function (Blueprint $table) {
            // 인덱스 제거 (역순으로)
            $table->dropIndex('idx_site_user_refresh_token');
            $table->dropIndex('idx_site_user_username');
        });
    }
};
