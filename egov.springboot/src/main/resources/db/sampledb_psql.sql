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


