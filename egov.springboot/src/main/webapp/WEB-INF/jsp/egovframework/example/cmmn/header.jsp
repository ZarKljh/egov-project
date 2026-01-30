<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.Properties" %>
<%@ page import="java.io.InputStream" %>

<%
    // globals.properties에서 URL 로드 (변수화 요청 반영)
    String nextUrl = "";
    String boardUrl = "";
    Properties props = new Properties();
    try (InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream("egovframework/egovProps/globals.properties")) {
        if (is != null) {
            props.load(is);
            nextUrl = props.getProperty("next.frontend.url");
            boardUrl = props.getProperty("jsp.board.url");
        }
    } catch (Exception e) {
        System.err.println("[Header Error] Properties load failed: " + e.getMessage());
    }
    request.setAttribute("nextUrl", nextUrl);
    request.setAttribute("boardUrl", boardUrl);
%>

<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
        corePlugins: { preflight: false } // 기존 게시판 스타일 보호
    }
</script>

<style>
    /* 1. 최상위 컨테이너 레이아웃 격리 */
    #header-wrapper.shadcn-root {
        font-family: ui-sans-serif, system-ui, sans-serif !important;
        box-sizing: border-box !important;
    }

    /* 2. 로고 직접 타격 (header 바로 아래의 a) */
    #header-wrapper.shadcn-root > header > div > a {
        font-size: 20px !important;
        font-weight: 700 !important;
        color: #036 !important;
        text-decoration: none !important;
    }

    /* 3. 메뉴 리스트 타격 (nav 바로 아래의 a들만) */
    #header-wrapper.shadcn-root > header > div > nav > a {
        font-size: 14px !important;
        text-decoration: none !important;
        transition: color 0.2s !important;
    }

    /* 4. 순서에 따른 개별 속성 부여 (자식 선택자 결합) */
    /* 홈, 민원문의, 통계현황 */
    #header-wrapper.shadcn-root > header > div > nav > a:nth-child(1),
    #header-wrapper.shadcn-root > header > div > nav > a:nth-child(2),
    #header-wrapper.shadcn-root > header > div > nav > a:nth-child(3) {
        font-weight: 500 !important;
        color: #475569 !important;
    }

		/* 우측 영역(권한 표시 + 버튼) 전체 컨테이너 타격 */
	#header-wrapper.shadcn-root > header > div:last-child {
	    display: flex !important;
	    align-items: center !important;
	    gap: 16px !important;       /* 권한 텍스트와 버튼 사이 간격 */
	    padding-right: 100px !important; /* 요청하신 오른쪽 여백 32px */
	    flex-shrink: 0 !important;   /* 화면이 좁아져도 찌그러지지 않게 방지 */
	}
	
	/* 권한 접속 중 텍스트 스타일 (Slate-500 색상 유지) */
	#header-wrapper.shadcn-root #auth-role-display {
	    font-size: 14px !important;
	    color: #64748b !important;
	    font-weight: 500 !important;
	    white-space: nowrap !important; /* 텍스트가 줄바꿈되어 깨지는 현상 방지 */
	}
	
	/* 권한 강조 텍스트 (ADMIN/USER) */
	#header-wrapper.shadcn-root #role-text {
	    color: #003366 !important;
	    font-weight: 700 !important;
	}

    /* 호버 스타일 */
    #header-wrapper.shadcn-root > header > div > nav > a:hover {
        color: #003366 !important;
    }
    /* 1. 배경 및 전체 레이아웃 */
    body { background-color: #f8fafc !important; margin: 0; padding: 0; }
    #content_pop { 
        max-width: 1300px !important;
        width: 95% !important; 
        margin: 40px auto !important; 
        padding: 24px !important;
        background: white !important;
        border-radius: 12px !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        float: none !important; /* 기존 float 제거 */
    }

    /* 2. 제목 (Next.js 로고 폰트와 통일) */
    #title { border: none !important; /* margin-bottom: 24px !important; */ width: 100% !important; }
    #title li { 
        font-family: sans-serif !important;
        font-size: 24px !important; 
        color: #0f172a !important; 
        font-weight: 700 !important; 
    }
    #title img { display: none; }

    /* 3. 검색창 (Shadcn Input 스타일) */
    #search { width: 100% !important; margin-bottom: 20px !important; }
    #search select, #search input {
        border: 1px solid #e2e8f0 !important;
        border-radius: 6px !important;
        padding: 4px 12px !important;
        font-size: 14px !important;
        height: 36px !important;
    }

    /* 4. 테이블 (현대적인 리스트 스타일 - 확장 및 정밀 조정) */
	#table { 
	    width: 100% !important; 
	    border: 1px solid #e2e8f0 !important; 
	    border-radius: 8px !important; 
	    overflow: hidden !important; 
	    background: white !important;
	}
	
	#table table { 
	    border-collapse: collapse !important; 
	    width: 100% !important;      /* 부모 너비를 꽉 채움 */
	    table-layout: fixed !important; /* 열 너비를 비율대로 강제 분배 */
	}
	
	#table th {
	    background: #f8fafc !important; /* 이미지보다 조금 더 밝은 muted 색상 */
	    color: #475569 !important;
	    font-size: 15px !important;
	    font-weight: 600 !important;
	    padding: 18px 12px !important; /* 높이를 키워서 시원하게 만듦 */
	    border-bottom: 1px solid #e2e8f0 !important;
	    text-align: center !important;
	}
	
	#table td {
	    padding: 16px 12px !important; /* 행 간격을 넓혀서 가독성 향상 */
	    font-size: 14px !important;
	    border-bottom: 1px solid #f1f5f9 !important;
	    color: #334155 !important;
	    text-align: center !important; /* 기본 중앙 정렬 */
	    word-break: break-all !important; /* 내용이 길어도 뚫고 나가지 않게 방지 */
	}
	
	/* 제목 열(2번째 열)만 왼쪽 정렬로 가독성 확보 */
	#table td:nth-child(2) {
	    text-align: left !important;
	    padding-left: 24px !important;
	}
	
	#table tr:last-child td {
	    border-bottom: none !important;
	}
	
	#table tr:hover { 
	    background: #f1f5f9 !important; /* 호버 시 조금 더 명확한 색상 변화 */
	}

    /* 5. 버튼 (Shadcn Button 스타일) */
    .btn_blue_l { background: none !important; padding: 0 !important; height: auto !important; }
    .btn_blue_l img { display: none !important; } /* 구식 화살표 제거 */
       
    #content_pop #sysbtn ul,
    #content_pop #sysbtn li,
    #content_pop #sysbtn span {
    	float:none !important;
    }
    
    #search a, #sysbtn a {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 6px !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        height: 36px !important;
        padding: 0 16px !important;
        text-decoration: none !important;
    }

    #search a { background: white !important; border: 1px solid #e2e8f0 !important; color: #0f172a !important; }
    #sysbtn a { background: #003366 !important; color: white !important; } /* Primary 버튼 */
    
    #sysbtn {
    	margin-bottom: 18px !important;
    	display: block !important;
    }
    
    /* Register 상세페이지 전용 강제 스타일 제어 */

	/* 1. 테이블 외곽선 및 레이아웃 강제 교체 */
	#content_pop #table table {
	    border: 1px solid #e2e8f0 !important;
	    border-radius: 12px !important;
	    border-collapse: separate !important; /* 기존 collapse 무시 */
	    border-spacing: 0 !important;
	    overflow: hidden !important;
	    width: 100% !important;
	    table-layout: fixed !important;
	}
	
	/* 2. 테이블 행(tr) 높이 및 배경 */
	#content_pop #table table tr {
	    border-bottom: 1px solid #f1f5f9 !important;
	}
	
	/* 3. 왼쪽 라벨 칸 (td.tbtd_caption) 강제 타격 */
	#content_pop #table table tr > td.tbtd_caption {
	    background-color: #f8fafc !important; /* 리스트 th와 통일 */
	    border: none !important;
	    border-bottom: 1px solid #f1f5f9 !important;
	    border-right: 1px solid #f1f5f9 !important;
	    padding: 16px 24px !important;
	    width: 180px !important;
	    text-align: left !important;
	    font-weight: 600 !important;
	    color: #475569 !important;
	}
	
	/* 4. 오른쪽 내용 칸 (td.tbtd_content) 강제 타격 */
	#content_pop #table table tr > td.tbtd_content {
	    border: none !important;
	    border-bottom: 1px solid #f1f5f9 !important;
	    padding: 12px 20px !important;
	    text-align: left !important;
	}
	
	/* 5. 입력 필드 (input, textarea) Shadcn 스타일 강제 이식 */
	#content_pop #table td.tbtd_content input.txt,
	#content_pop #table td.tbtd_content input.essentiality,
	#content_pop #table td.tbtd_content textarea,
	#content_pop #table td.tbtd_content select {
	    width: 100% !important;
	    /*
	    padding: 8px 12px !important;
	    */
	    border: 1px solid #e2e8f0 !important;
	    border-radius: 6px !important;
	    font-size: 14px !important;
	    outline: none !important;
	    box-shadow: none !important;
	    transition: all 0.2s !important;
	}
	
	/* 포커스 효과 */
	#content_pop #table td.tbtd_content input:focus,
	#content_pop #table td.tbtd_content textarea:focus,
	#content_pop #table td.tbtd_content select:focus {
	    border-color: #003366 !important;
	    box-shadow: 0 0 0 2px rgba(0, 51, 102, 0.1) !important;
	}
    
    /* 과거답변영역 */
    /* --- 답변 이력(Answer Card) 전용 디자인 --- */

	/* 답변 영역 전체 컨테이너 */
	#answer_section {
	    margin-top: 48px !important;
	    padding-top: 32px !important;
	    border-top: 1px solid #e2e8f0 !important;
	}
	
	/* 답변 개별 카드 */
	.answer-card {
	    background: #ffffff !important;
	    border: 1px solid #e2e8f0 !important;
	    border-radius: 12px !important;
	    margin-bottom: 24px !important;
	    overflow: hidden !important;
	    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
	}
	
	/* 답변 카드 헤더 (작성 정보 및 관리 버튼) */
	.answer-header {
	    background: #f8fafc !important; /* 기존 테이블 th 배경색과 통일 */
	    padding: 14px 20px !important;
	    border-bottom: 1px solid #f1f5f9 !important;
	    display: flex !important;
	    justify-content: space-between !important;
	    align-items: center !important;
	}
	
	.answer-header .info-group {
	    display: flex !important;
	    align-items: center !important;
	    gap: 12px !important;
	}
	
	.answer-header .answer-count {
	    font-weight: 700 !important;
	    color: #0f172a !important;
	    font-size: 14px !important;
	}
	
	.answer-header .answer-date {
	    font-size: 13px !important;
	    color: #64748b !important;
	}
	
	/* 답변 카드 본문 */
	.answer-body {
	    padding: 24px !important;
	    display: flex !important;
	    flex-direction: column !important; /* 내부 요소(뱃지, 텍스트)를 위아래로 배치 */
	    align-items: flex-start !important; /* 왼쪽 정렬 */
	    font-size: 15px !important;
	    line-height: 1.7 !important;
	    color: #334155 !important;
	}
	
	/* 서식 뱃지 스타일 */
	.form-badge {
	    display: inline-flex !important; 
	    align-items: center !important;
	    justify-content: flex-start !important;
	    width: auto !important;          /* 내용만큼만 너비 가짐 */
	    max-width: fit-content !important;
	    background: #f1f5f9 !important;
	    color: #475569 !important;
	    padding: 6px 12px !important;
	    border-radius: 6px !important;
	    font-size: 13px !important;
	    font-weight: 600 !important;
	    margin-bottom: 16px !important;  /* 답변 내용과의 명확한 간격 */
	    border: 1px solid #e2e8f0 !important;
	}
	
	/* 수정/삭제 버튼 스타일 */
	.answer-actions {
	    display: flex !important;
	    gap: 8px !important;
	}
	
	.answer-actions a {
	    font-size: 13px !important;
	    font-weight: 500 !important;
	    padding: 4px 10px !important;
	    border-radius: 4px !important;
	    text-decoration: none !important;
	    transition: all 0.2s !important;
	}
	
	.btn-edit-link { color: #003366 !important; background: #f0f7ff !important; }
	.btn-edit-link:hover { background: #e0efff !important; }
	
	.btn-delete-link { color: #ef4444 !important; background: #fef2f2 !important; }
	.btn-delete-link:hover { background: #fee2e2 !important; }
	
	/* 신규 답변 등록 영역 버튼 (Primary 스타일 유지) */
	.btn-answer-submit {
	    background: #003366 !important;
	    color: white !important;
	    border: none !important;
	    padding: 10px 24px !important;
	    border-radius: 8px !important;
	    font-weight: 600 !important;
	    cursor: pointer !important;
	    margin-top: 20px !important;
	    float: right !important;
	}
    
</style>

 <div id="header-wrapper" class="shadcn-root"> 
	<header class="w-full h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
	
	    
	    <div class="flex items-center gap-8">
	        <a href="${nextUrl}/" class="text-xl font-bold text-[#003366] no-underline">
	            eGov 민원 문의 시스템
	        </a>
	
	        <nav class="flex gap-6 text-sm font-medium text-slate-600">
	            <a href="${nextUrl}/" class="hover:text-[#003366] no-underline transition-colors">홈</a>
	            
	            <a href="${pageContext.request.contextPath}${boardUrl}" id="nav-user-menu" class="hidden hover:text-[#003366] no-underline transition-colors">
	                민원문의(JSP)
	            </a>
	            
	            <a href="${nextUrl}/admin" id="nav-admin-menu" class="hidden hover:text-[#003366] no-underline transition-colors">
	                통계현황(Admin)
	            </a>
	        </nav>
	    </div>
	
	    <div class="flex items-center gap-4">
	        <span id="auth-role-display" class="hidden text-sm text-slate-500 font-medium">
	            <span id="role-text" class="text-[#003366] font-bold"></span> 권한 접속 중
	        </span>
	
	        <div id="auth-action-area"></div>
	    </div>
	</header>
</div>
<script>
    /**
     * [Next.js Logic 이식] useEffect()와 handleLogout() 기능을 순수 JS로 구현
     */
    (function initHeader() {
        const token = getCookie('auth_token');
        const roleDisplay = document.getElementById('auth-role-display');
        const roleText = document.getElementById('role-text');
        const actionArea = document.getElementById('auth-action-area');
        const userMenu = document.getElementById('nav-user-menu');
        const adminMenu = document.getElementById('nav-admin-menu');

        if (token) {
            try {
                // Next.js의 jwtDecode<AuthToken>(token) 기능을 재현
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decoded = JSON.parse(window.atob(base64));
                const role = decoded.role; // 'ADMIN' | 'USER'

                // 1. 역할 기반 조건부 렌더링
                if (role === 'USER' || role === 'ADMIN') userMenu.classList.remove('hidden');
                if (role === 'ADMIN') adminMenu.classList.remove('hidden');

                // 2. 권한 표시 텍스트
                roleDisplay.classList.remove('hidden');
                roleText.innerText = role;

                // 3. 로그아웃 버튼 (Next.js의 Button variant="outline" 스타일)
                actionArea.innerHTML = `
                    <button onclick="handleLogout()" class="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-100 h-9 px-4 transition-colors">
                        로그아웃
                    </button>`;
            } catch (e) {
                console.error("Token decoding failed:", e);
                renderLogin();
            }
        } else {
            renderLogin();
        }

        function renderLogin() {
            actionArea.innerHTML = `
                <a href="${nextUrl}/login" class="no-underline">
                    <button class="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-100 h-9 px-4 transition-colors">
                        로그인
                    </button>
                </a>`;
        }
    })();

    // [Next.js handleLogout 이식] 쿠키 삭제 후 리다이렉트
    function handleLogout() {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "${nextUrl}/login";
    }

    function getCookie(name) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }
</script>