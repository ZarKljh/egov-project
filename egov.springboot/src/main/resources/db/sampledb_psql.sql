-- 테이블이 없을 때만 생성하도록 수정 (PostgreSQL 문법)
CREATE TABLE IF NOT EXISTS SAMPLE (
    ID VARCHAR(16) NOT NULL,
    NAME VARCHAR(50),
    DESCRIPTION VARCHAR(100),
    USE_YN CHAR(1),
    REG_USER VARCHAR(10),
    PRIMARY KEY (ID)
);

-- 데이터 중복 방지를 위해 삭제 후 삽입 또는 조건부 삽입 권장
DELETE FROM SAMPLE WHERE ID = 'SAMPLE-00001';
INSERT INTO SAMPLE (ID, NAME, DESCRIPTION, USE_YN, REG_USER) 
VALUES ('SAMPLE-00001', '자동 생성 게시글', '서버 기동 시 자동 실행됨', 'Y', 'admin');


-- 1. 회원 정보 테이블
CREATE TABLE IF NOT EXISTS site_user (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    postcode VARCHAR(20),
    address_default VARCHAR(100),
    address_detail VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',
	refresh_token VARCHAR(1000) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

------관리자계정 init-------
INSERT INTO site_user (
    username, 
    password, 
    name, 
    phone, 
    email, 
    postcode, 
    address_default, 
    address_detail, 
    role
)
SELECT 
    'admin',           -- username
    '1234!',       -- password
    '최고관리자',      -- name
    '010-1234-5678',   -- phone
    'admin@test.com',-- email
    '12345',           -- postcode
    '서울시 중구 세종대로', -- address_default
    '100번지 1층',     -- address_detail
    'ADMIN'            -- role
WHERE NOT EXISTS (
    SELECT 1 FROM site_user WHERE username = 'admin'
);

-- 2. 민원 게시글 테이블
CREATE TABLE IF NOT EXISTS article (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER,              -- FK 아직 안 씀 (그냥 숫자 필드)
    form_id INTEGER,              -- 사용한 민원서식 ID
    sort_order INTEGER DEFAULT 0,
    dept INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'REGISTER', 
    root_id INTEGER DEFAULT 0,
    parent_article_id INTEGER DEFAULT 0, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_article_user FOREIGN KEY (user_id) REFERENCES site_user (user_id)
);

-- 3. 첨부 서류 / 파일 테이블
CREATE TABLE IF NOT EXISTS document (
    document_id SERIAL PRIMARY KEY,
    article_id INTEGER,            -- 게시글 번호(연결 예정 필드)
    original_name VARCHAR(255),
    saved_name VARCHAR(255),
    file_path VARCHAR(400),
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 댓글(답변) 테이블
CREATE TABLE IF NOT EXISTS answer (
    answer_id SERIAL PRIMARY KEY,
    article_id INTEGER,            -- 게시글 번호
    user_id INTEGER,               -- 작성자
    form_id INTEGER,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 민원 서식 종류 테이블
CREATE TABLE IF NOT EXISTS forms (
    form_id SERIAL PRIMARY KEY,
    form_name VARCHAR(200) NOT NULL,
    description TEXT,
    downloadable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-----------민원서식데이터 init-------------------------
-- PC 유지보수
INSERT INTO forms (form_name, description, downloadable)
SELECT 'PC 유지보수', 'PC 수리 및 하드웨어 점검 요청입니다.', FALSE
WHERE NOT EXISTS (SELECT 1 FROM forms WHERE form_name = 'PC 유지보수');

-- 프로그램 설치
INSERT INTO forms (form_name, description, downloadable)
SELECT '프로그램 설치', '업무용 소프트웨어 설치 요청입니다.', FALSE
WHERE NOT EXISTS (SELECT 1 FROM forms WHERE form_name = '프로그램 설치');

-- 계정신청
INSERT INTO forms (form_name, description, downloadable)
SELECT '계정신청', '시스템 및 사내망 계정 권한 신청입니다.', FALSE
WHERE NOT EXISTS (SELECT 1 FROM forms WHERE form_name = '계정신청');

-- 주민등록초본 (요청하신 항목)
INSERT INTO forms (form_name, description, downloadable)
SELECT '주민등록초본', '주민등록초본 발급 신청 서식입니다.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM forms WHERE form_name = '주민등록초본');
