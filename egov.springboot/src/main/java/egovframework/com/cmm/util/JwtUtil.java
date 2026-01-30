package egovframework.com.cmm.util;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Properties;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.JwtException;

public class JwtUtil {

	private static String SECRET_KEY;
	
	// 성능 최적화: Key를 static final로 한 번만 생성하여 재사용
	private static final Key SIGNING_KEY;
	
	// 클래스가 로드될 때 설정 파일에서 키를 읽어옵니다.
	static {
		String propPath = "egovframework/egovProps/globals.properties";
		Key tempKey = null;
        
        try (InputStream input = JwtUtil.class.getClassLoader().getResourceAsStream(propPath)) {
            Properties prop = new Properties();
            if (input == null) {
                System.err.println("[Critical Error] Cannot find property file: " + propPath);
            } else {
                prop.load(input);
                SECRET_KEY = prop.getProperty("jwt.secret");
                
                if (SECRET_KEY == null || SECRET_KEY.trim().isEmpty()) {
                    System.err.println("[Critical Error] 'jwt.secret' is not configured in globals.properties.");
                } else {
                    System.out.println("[Init] JwtUtil: Secret key loaded successfully.");
                    // Key를 한 번만 생성하여 static final로 저장
                    tempKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        
        SIGNING_KEY = tempKey;
    }
	
	/**
     * 쿠키에서 토큰 추출
     */
    public static String resolveToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
    
    /**
     * 토큰 검증 및 파싱
     * 
     * @param token JWT 토큰 문자열
     * @return Claims 토큰에서 추출한 클레임 정보
     * @throws ExpiredJwtException 토큰이 만료된 경우
     * @throws MalformedJwtException 토큰 형식이 잘못된 경우
     * @throws JwtException 토큰 서명이 유효하지 않거나 기타 JWT 관련 오류
     * @throws IllegalArgumentException 토큰이 null이거나 빈 문자열인 경우
     */
    public static Claims validateAndParseToken(String token) 
            throws ExpiredJwtException, MalformedJwtException, JwtException, IllegalArgumentException {
        
        if (SIGNING_KEY == null) {
            throw new IllegalStateException("JWT signing key is not initialized. Check globals.properties configuration.");
        }
        
        // 성능 최적화: static final로 관리되는 Key 재사용
        return Jwts.parserBuilder()
                .setSigningKey(SIGNING_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    
    /**
     * HttpServletRequest에서 사용자 권한(role) 추출
     * 
     * [사용 목적]
     * - 컨트롤러에서 JSP에 권한 정보를 전달할 때 사용
     * - 권한 기반 UI 렌더링 (예: ADMIN만 답변 등록 영역 표시)
     * 
     * [동작 방식]
     * 1. 쿠키에서 JWT 토큰 추출
     * 2. 토큰 검증 및 파싱
     * 3. Claims에서 role 추출
     * 
     * [예외 처리]
     * - 토큰이 없거나 유효하지 않으면 null 반환 (예외 발생하지 않음)
     * - 안전하게 처리되어 JSP에서 권한 체크 시 null 체크만 하면 됨
     * 
     * @param request HttpServletRequest 객체
     * @return 사용자 권한 (ADMIN, USER 등) 또는 null (토큰이 없거나 유효하지 않은 경우)
     */
    public static String getUserRole(HttpServletRequest request) {
        try {
            String token = resolveToken(request);
            if (token == null || token.isEmpty()) {
                return null;
            }
            
            Claims claims = validateAndParseToken(token);
            return claims.get("role", String.class);
        } catch (Exception e) {
            // 토큰이 없거나 유효하지 않으면 null 반환 (예외를 발생시키지 않음)
            // 로그는 필요시에만 출력 (너무 많은 로그 방지)
            return null;
        }
    }
    
    /**
     * HttpServletRequest에서 사용자 ID 추출 (안전한 방식)
     * 
     * [사용 목적]
     * - userId가 Integer 또는 String 타입일 수 있으므로 안전하게 추출
     * - JwtInterceptor와 동일한 로직 사용
     * 
     * @param request HttpServletRequest 객체
     * @return 사용자 ID (String) 또는 null
     */
    public static String getUserId(HttpServletRequest request) {
        try {
            String token = resolveToken(request);
            if (token == null || token.isEmpty()) {
                return null;
            }
            
            Claims claims = validateAndParseToken(token);
            
            // userId를 여러 방법으로 시도 (Integer, String 등)
            Object userIdObj = claims.get("userId");
            if (userIdObj != null) {
                if (userIdObj instanceof String) {
                    return (String) userIdObj;
                } else if (userIdObj instanceof Integer) {
                    return String.valueOf(userIdObj);
                } else {
                    return userIdObj.toString();
                }
            }
            
            // 다른 가능한 claim 이름들 시도
            Object subObj = claims.get("sub");
            if (subObj != null) {
                return subObj.toString();
            }
            
            Object user_idObj = claims.get("user_id");
            if (user_idObj != null) {
                return user_idObj.toString();
            }
            
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * HttpServletRequest에서 사용자명(username) 추출 (안전한 방식)
     * Laravel JWT의 getJWTCustomClaims()에 포함된 username claim 사용
     *
     * @param request HttpServletRequest 객체
     * @return 사용자명 또는 null
     */
    public static String getUsername(HttpServletRequest request) {
        try {
            String token = resolveToken(request);
            if (token == null || token.isEmpty()) {
                return null;
            }
            Claims claims = validateAndParseToken(token);
            return claims.get("username", String.class);
        } catch (Exception e) {
            return null;
        }
    }
	
}
