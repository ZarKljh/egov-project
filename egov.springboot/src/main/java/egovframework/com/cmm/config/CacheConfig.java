package egovframework.com.cmm.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ============================================
 * [성능 최적화] Spring Cache 설정
 * ============================================
 * 
 * [목적]
 * - 게시판 목록 조회 성능 향상 (2.28초 → 1초대 목표)
 * - 메모리 기반 캐싱으로 DB 조회 횟수 감소
 * 
 * [캐시 전략]
 * - ConcurrentMapCacheManager: 메모리 기반 캐시 (간단하고 빠름)
 * - 캐시 이름: "boardList", "boardDetail", "boardCount"
 * 
 * [성능 효과]
 * - 첫 조회: DB 조회 (약 0.5초)
 * - 이후 조회: 캐시에서 반환 (약 0.01초)
 * - 예상 개선: 약 1초 단축
 * 
 * [주의사항]
 * - 글쓰기/수정/삭제 시 @CacheEvict로 캐시 무효화 필수
 * - 메모리 사용량 모니터링 필요 (대용량 데이터 시 Redis 고려)
 */
@Configuration
@EnableCaching  // Spring Cache 활성화
public class CacheConfig {

    /**
     * [성능 최적화] 메모리 기반 캐시 매니저 설정
     * 
     * [설명]
     * - ConcurrentMapCacheManager: 내부적으로 ConcurrentHashMap 사용
     * - 스레드 안전하며 빠른 조회 성능 제공
     * - 프로덕션 환경에서는 Redis나 Caffeine 고려 가능
     * 
     * [캐시 이름]
     * - "boardList": 게시판 목록 캐시
     * - "boardDetail": 게시글 상세 캐시
     * - "boardCount": 게시글 총 개수 캐시
     * 
     * @return CacheManager 인스턴스
     */
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        
        // 캐시 이름 사전 정의 (선택사항)
        // 동적으로 생성되므로 생략 가능하지만, 명시적으로 정의하면 관리 용이
        cacheManager.setCacheNames(java.util.Arrays.asList(
            "boardList",      // 게시판 목록 캐시
            "boardDetail",    // 게시글 상세 캐시
            "boardCount"      // 게시글 총 개수 캐시
        ));
        
        // 캐시 저장소를 동적으로 생성 허용 (캐시 이름이 사전 정의되지 않아도 생성 가능)
        cacheManager.setAllowNullValues(false);  // null 값 캐싱 방지
        
        return cacheManager;
    }
}
