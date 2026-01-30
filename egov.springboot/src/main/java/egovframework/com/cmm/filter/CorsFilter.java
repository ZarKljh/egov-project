package egovframework.com.cmm.filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

/**
 * CORS 헤더를 응답에 추가하는 필터
 * 
 * [목적]
 * - 모든 요청에 CORS 헤더를 추가하여 브라우저 CORS 정책 위반 방지
 * - 필터는 인터셉터보다 먼저 실행되므로 가장 확실하게 CORS 헤더를 추가할 수 있음
 * 
 * [동작 원리]
 * - globals.properties의 cors.allowed.origins를 읽어 허용된 Origin만 CORS 허용
 * - OPTIONS 요청(Preflight)도 처리하여 브라우저의 사전 요청 허용
 * 
 * [실행 순서]
 * 1. 필터 (CorsFilter) - CORS 헤더 추가
 * 2. 인터셉터 (JwtInterceptor) - JWT 검증
 * 3. 컨트롤러 - 비즈니스 로직 처리
 */
public class CorsFilter implements Filter {
    
    private static final String PROPS_PATH = "egovframework/egovProps/globals.properties";
    
    /**
     * globals.properties에서 허용된 Origin 목록 조회
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
    
    /**
     * globals.properties 파일 로드
     */
    private Properties loadProperties() {
        try (InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream(PROPS_PATH)) {
            if (is == null) return null;
            Properties props = new Properties();
            props.load(is);
            return props;
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 요청 Origin이 허용된 Origin 목록에 있는지 확인
     */
    private boolean isAllowedOrigin(String origin) {
        if (origin == null || origin.isEmpty()) return false;
        return getAllowedOrigins().stream().anyMatch(allowed -> allowed.equals(origin));
    }
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 초기화 불필요
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String origin = httpRequest.getHeader("Origin");
        
        // CORS 헤더 추가 (허용된 Origin만)
        if (isAllowedOrigin(origin)) {
            httpResponse.setHeader("Access-Control-Allow-Origin", origin);
            httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
            httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
            httpResponse.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
            httpResponse.setHeader("Access-Control-Max-Age", "3600");
        }
        
        // OPTIONS 요청(Preflight) 처리
        // 브라우저가 실제 요청 전에 보내는 사전 요청
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return; // OPTIONS 요청은 여기서 종료 (컨트롤러로 가지 않음)
        }
        
        // 다음 필터/인터셉터/컨트롤러로 요청 전달
        chain.doFilter(request, response);
    }
    
    @Override
    public void destroy() {
        // 정리 불필요
    }
}
