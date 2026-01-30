package egovframework.com.cmm.interceptor;

import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.HandlerInterceptor;

import egovframework.com.cmm.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;

public class JwtInterceptor implements HandlerInterceptor{
	
	private static final String PROPS_PATH = "egovframework/egovProps/globals.properties";

	/**
	 * globals.properties에서 로그인 URL 조회
	 */
	private String getLoginUrlFromProperties() {
        Properties props = loadProperties();
        return props != null ? props.getProperty("next.login.url") : null;
    }

	/**
	 * globals.properties에서 CORS 허용 Origin 목록 조회 (쉼표 구분)
	 * 배포 시 도메인을 추가하면 해당 Origin 허용 (예: https://yourdomain.com)
	 */
	private List<String> getAllowedOrigins() {
		Properties props = loadProperties();
		if (props == null) {
			return Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000");
		}
		String value = props.getProperty("cors.allowed.origins", "http://localhost:3000,http://127.0.0.1:3000");
		return Arrays.stream(value.split(","))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.collect(Collectors.toList());
	}

	private boolean isAllowedOrigin(String origin) {
		if (origin == null || origin.isEmpty()) return false;
		return getAllowedOrigins().stream().anyMatch(allowed -> allowed.equals(origin));
	}

	private Properties loadProperties() {
		try (InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream(PROPS_PATH)) {
			if (is == null) return null;
			Properties props = new Properties();
			props.load(is);
			return props;
		} catch (Exception e) {
			System.err.println("[Error] Exception while loading properties: " + e.getMessage());
			return null;
		}
	}
	
	/**
	 * AJAX 요청인지 판별
	 * X-Requested-With: XMLHttpRequest 또는 Accept: application/json 헤더 확인
	 */
	private boolean isAjaxRequest(HttpServletRequest request) {
		String requestedWith = request.getHeader("X-Requested-With");
		String accept = request.getHeader("Accept");
		
		boolean isXmlHttpRequest = "XMLHttpRequest".equalsIgnoreCase(requestedWith);
		boolean isJsonAccept = accept != null && accept.contains("application/json");
		
		return isXmlHttpRequest || isJsonAccept;
	}
	
	/**
	 * JSON 문자열에서 특수 문자 이스케이프 처리
	 */
	private String escapeJsonString(String str) {
		if (str == null) {
			return "null";
		}
		return str.replace("\\", "\\\\")
		          .replace("\"", "\\\"")
		          .replace("\n", "\\n")
		          .replace("\r", "\\r")
		          .replace("\t", "\\t");
	}
	
	/**
	 * AJAX 요청에 대한 JSON 에러 응답
	 * Jackson 의존성 없이 직접 JSON 문자열 생성
	 * CORS 헤더를 포함하여 브라우저가 응답을 읽을 수 있도록 함
	 */
	private void sendJsonErrorResponse(HttpServletRequest request, HttpServletResponse response, String code, String message, int statusCode) throws IOException {
		// CORS 헤더 추가 (에러 응답에도 필수!) - globals.properties의 cors.allowed.origins 사용
		String origin = request.getHeader("Origin");
		if (isAllowedOrigin(origin)) {
			response.setHeader("Access-Control-Allow-Origin", origin);
			response.setHeader("Access-Control-Allow-Credentials", "true");
			response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
			response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
		}
		
		response.setStatus(statusCode);
		response.setContentType("application/json;charset=UTF-8");
		
		PrintWriter out = response.getWriter();
		try {
			// JSON 문자열 직접 생성 (Jackson 의존성 없이)
			String jsonResponse = String.format(
				"{\"status\":\"error\",\"code\":\"%s\",\"message\":\"%s\"}",
				escapeJsonString(code),
				escapeJsonString(message)
			);
			out.print(jsonResponse);
			out.flush();
		} finally {
			if (out != null) {
				out.close();
			}
		}
	}
	
	/**
	 * 일반 요청에 대한 리다이렉트 처리
	 */
	private void handleAuthenticationFailure(HttpServletResponse response) throws IOException {
		String loginUrl = getLoginUrlFromProperties();
		
		if(loginUrl == null || loginUrl.trim().isEmpty()) {
			System.err.println("[Critical Error] 'next.login.url'이 globals.properties에 설정되지 않았습니다.");
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "System configuration error: Login URL missing.");
			return;
		}
		
		System.out.println("[Auth Failure] Redirecting to: " + loginUrl);
		response.sendRedirect(loginUrl);
	}
	
	
	/**
	 * 컨트롤러 실행 전 JWT 토큰 검증
	 * false 반환 시 요청이 중단되고 사용자는 튕겨 나감
	 */
	@Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // #region agent log
        try {
        	FileWriter fw = new FileWriter("d:\\si-project\\workspace-egov\\.cursor\\debug.log", true);
        	fw.write("{\"timestamp\":" + System.currentTimeMillis() + ",\"location\":\"JwtInterceptor:preHandle\",\"message\":\"인터셉터 실행됨\",\"data\":{\"uri\":\"" + request.getRequestURI() + "\",\"method\":\"" + request.getMethod() + "\",\"handler\":\"" + (handler != null ? handler.getClass().getName() : "null") + "\"},\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"D\"}\n");
        	fw.close();
        } catch (IOException e) {}
        // #endregion
		 // 디버깅: 모든 /api/** 요청 로그 출력
	    System.out.println("[INTERCEPTOR DEBUG] 요청 도달: " + request.getRequestURI() + ", Method: " + request.getMethod());
	    System.out.println("[INTERCEPTOR DEBUG] Handler: " + (handler != null ? handler.getClass().getName() : "null"));
	    
		
		
        // OPTIONS 요청(Preflight)은 CorsFilter에서 처리하므로 여기서는 제거
        // (필터가 인터셉터보다 먼저 실행되므로 필터에서 이미 처리됨)
        
        // CORS 헤더는 CorsFilter에서 처리하므로 여기서는 제거
        // (필터가 인터셉터보다 먼저 실행되므로 필터에서 이미 CORS 헤더 추가됨)
        
        // 1. 요청(Cookie)에서 JWT 토큰 추출
        String token = JwtUtil.resolveToken(request);

        // 2. 토큰이 아예 없는 경우
        if (token == null || token.isEmpty()) {
            System.out.println("[Auth Failure] Token not found.");
            
            if (isAjaxRequest(request)) {
                sendJsonErrorResponse(request, response, "TOKEN_NOT_FOUND", "인증 토큰이 없습니다.", HttpServletResponse.SC_UNAUTHORIZED);
            } else {
                handleAuthenticationFailure(response);
            }
            return false;
        }

        // 3. 토큰 검증 및 데이터(Claims) 추출
        try {
            Claims claims = JwtUtil.validateAndParseToken(token);
            
            // 4. 토큰 만료 시간 검증 (추가 안전장치)
            if (claims.getExpiration().before(new Date())) {
                System.out.println("[Auth Failure] Token has expired.");
                
                if (isAjaxRequest(request)) {
                    sendJsonErrorResponse(request, response, "TOKEN_EXPIRED", "토큰이 만료되었습니다.", HttpServletResponse.SC_UNAUTHORIZED);
                } else {
                    handleAuthenticationFailure(response);
                }
                return false;
            }

            // 5. 인증 성공 (추후 권한 제어 시 사용하기 위해 request에 정보 저장)
            String role = claims.get("role", String.class);
            
            // 디버깅: 모든 claims 출력
            System.out.println("[JWT Debug] All claims: " + claims.toString());
            System.out.println("[JWT Debug] Claims keys: " + claims.keySet());
            
            // userId를 여러 방법으로 시도
            String userId = null;
            Object userIdObj = claims.get("userId");
            System.out.println("[JWT Debug] userId claim (raw): " + userIdObj + " (type: " + (userIdObj != null ? userIdObj.getClass().getName() : "null") + ")");
            
            if (userIdObj != null) {
                if (userIdObj instanceof String) {
                    userId = (String) userIdObj;
                } else if (userIdObj instanceof Integer) {
                    userId = String.valueOf(userIdObj);
                } else {
                    userId = userIdObj.toString();
                }
            } else {
                // 다른 가능한 claim 이름들 시도
                Object subObj = claims.get("sub");
                System.out.println("[JWT Debug] sub claim: " + subObj);
                if (subObj != null) {
                    userId = subObj.toString();
                } else {
                    Object user_idObj = claims.get("user_id");
                    System.out.println("[JWT Debug] user_id claim: " + user_idObj);
                    if (user_idObj != null) {
                        userId = user_idObj.toString();
                    }
                }
            }
            
            request.setAttribute("userRole", role);
            request.setAttribute("userId", userId);
            
            System.out.println("[Auth Success] Access Granted. User Role: " + role + ", User ID: " + userId);
            return true; // 컨트롤러로 진입 허용
            
        } catch (ExpiredJwtException e) {
            // 토큰 만료 예외 처리
            System.out.println("[Auth Failure] Token expired: " + e.getMessage());
            
            if (isAjaxRequest(request)) {
                sendJsonErrorResponse(request, response, "TOKEN_EXPIRED", "토큰이 만료되었습니다.", HttpServletResponse.SC_UNAUTHORIZED);
            } else {
                handleAuthenticationFailure(response);
            }
            return false;
            
        } catch (MalformedJwtException e) {
            // 토큰 형식 오류
            System.out.println("[Auth Failure] Malformed token: " + e.getMessage());
            
            if (isAjaxRequest(request)) {
                sendJsonErrorResponse(request, response, "TOKEN_INVALID", "유효하지 않은 토큰 형식입니다.", HttpServletResponse.SC_UNAUTHORIZED);
            } else {
                handleAuthenticationFailure(response);
            }
            return false;
            
        } catch (JwtException e) {
            // 토큰 서명 오류 또는 기타 JWT 관련 오류
            System.out.println("[Auth Failure] JWT error: " + e.getMessage());
            
            if (isAjaxRequest(request)) {
                sendJsonErrorResponse(request, response, "TOKEN_INVALID", "토큰이 유효하지 않습니다.", HttpServletResponse.SC_UNAUTHORIZED);
            } else {
                handleAuthenticationFailure(response);
            }
            return false;
            
        } catch (IllegalArgumentException e) {
            // 토큰이 null이거나 빈 문자열
            System.out.println("[Auth Failure] Invalid token argument: " + e.getMessage());
            
            if (isAjaxRequest(request)) {
                sendJsonErrorResponse(request, response, "TOKEN_INVALID", "토큰이 제공되지 않았습니다.", HttpServletResponse.SC_UNAUTHORIZED);
            } else {
                handleAuthenticationFailure(response);
            }
            return false;
            
        } catch (Exception e) {
            // 기타 예외
            System.err.println("[Auth Failure] Unexpected error: " + e.getMessage());
            e.printStackTrace();
            
            if (isAjaxRequest(request)) {
                sendJsonErrorResponse(request, response, "AUTH_ERROR", "인증 처리 중 오류가 발생했습니다.", HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            } else {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "인증 처리 중 오류가 발생했습니다.");
            }
            return false;
        }
    }
}
