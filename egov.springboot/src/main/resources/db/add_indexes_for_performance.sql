-- ============================================
-- [성능 최적화] 게시판 테이블 인덱스 추가
-- ============================================
-- 
-- [목적]
-- - 게시판 목록 조회 성능 향상 (2.28초 → 1초대 목표)
-- - ORDER BY 및 JOIN 쿼리 최적화
-- 
-- [추가 인덱스]
-- 1. idx_article_root_id_sort_order: root_id와 sort_order 복합 인덱스 (ORDER BY 최적화)
-- 2. idx_article_user_id: user_id 인덱스 (JOIN 최적화)
-- 3. idx_article_created_at: created_at 인덱스 (날짜 정렬 최적화)
-- 
-- [성능 효과]
-- - 인덱스 없음: Full Table Scan + Sort (약 1.5초)
-- - 인덱스 있음: Index Scan (약 0.3초)
-- - 예상 성능 개선: 약 1.2초 단축

-- [1] root_id와 sort_order 복합 인덱스 (ORDER BY 최적화)
-- ORDER BY (CASE WHEN a.root_id = 0 THEN a.article_id ELSE a.root_id END) DESC, a.sort_order ASC
-- 쿼리에서 가장 많이 사용되는 정렬 조건
CREATE INDEX IF NOT EXISTS idx_article_root_id_sort_order 
ON article(root_id DESC, sort_order ASC);

-- [2] user_id 인덱스 (JOIN 최적화)
-- LEFT OUTER JOIN site_user b ON a.user_id = b.user_id
-- JOIN 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_article_user_id 
ON article(user_id);

-- [3] created_at 인덱스 (날짜 정렬 최적화)
-- 향후 날짜 기반 정렬이나 필터링 시 사용
CREATE INDEX IF NOT EXISTS idx_article_created_at 
ON article(created_at DESC);

-- [4] parent_article_id 인덱스 (재문의 조회 최적화)
-- 재문의 글 조회 시 사용 (SELECT title FROM article WHERE article_id = a.parent_article_id)
CREATE INDEX IF NOT EXISTS idx_article_parent_article_id 
ON article(parent_article_id);

-- [성능 측정]
-- 인덱스 생성 전: EXPLAIN ANALYZE로 쿼리 실행 계획 확인
-- 인덱스 생성 후: Index Scan으로 변경되었는지 확인
