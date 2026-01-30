package egovframework.com.cmm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.InputStream;
import java.util.Arrays;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

/**
 * ============================================
 * [성능 최적화] Spring MVC 설정 - 정적 리소스 캐싱
 * ============================================
 * 
 * [목적]
 * - 정적 리소스(JS, CSS, 이미지) HTTP 캐싱으로 로딩 속도 개선
 * - 브라우저 캐시 활용으로 서버 부하 감소
 * 
 * [캐시 전략]
 * - JS, CSS: 1년 캐싱 (파일명에 버전 포함 시)
 * - 이미지: 1년 캐싱
 * - 폰트: 1년 캐싱
 * 
 * [성능 효과]
 * - 첫 로딩: 정적 리소스 다운로드 (약 0.5초)
 * - 이후 로딩: 브라우저 캐시에서 로드 (약 0.01초)
 * - 예상 성능 개선: 약 0.5초 단축
 * 
 * [주의사항]
 * - 파일 변경 시 파일명에 버전 추가 필요 (예: app.v2.js)
 * - 또는 Cache-Control 헤더를 max-age로 설정하여 주기적 갱신
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private static final String PROPS_PATH = "egovframework/egovProps/globals.properties";

    /**
     * [CORS] globals.properties의 cors.allowed.origins 로 허용 Origin 설정
     * 배포 시 도메인 추가: cors.allowed.origins=https://yourdomain.com,https://www.yourdomain.com
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String allowedOrigins = getCorsAllowedOrigins();
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            allowedOrigins = "http://localhost:3000,http://127.0.0.1:3000";
        }
        final String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "X-Requested-With")
                .allowCredentials(true)
                .maxAge(3600);
    }

    private String getCorsAllowedOrigins() {
        try (InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream(PROPS_PATH)) {
            if (is == null) return null;
            Properties props = new Properties();
            props.load(is);
            return props.getProperty("cors.allowed.origins");
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * [성능 최적화] 정적 리소스 핸들러 설정
     * 
     * [설명]
     * - addResourceHandler: URL 패턴 지정
     * - addResourceLocations: 실제 파일 위치 지정
     * - setCacheControl: HTTP Cache-Control 헤더 설정
     * 
     * [캐시 설정]
     * - maxAge(365, TimeUnit.DAYS): 1년간 캐싱
     * - cachePublic(): public 캐시 허용 (프록시 서버에서도 캐싱 가능)
     * - mustRevalidate(): 캐시 만료 후 서버에서 재검증 필요
     * 
     * @param registry ResourceHandlerRegistry
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // [1] JavaScript 파일 캐싱
        registry.addResourceHandler("/js/**")
                .addResourceLocations("/js/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS)
                        .cachePublic()
                        .mustRevalidate());

        // [2] CSS 파일 캐싱
        registry.addResourceHandler("/css/**")
                .addResourceLocations("/css/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS)
                        .cachePublic()
                        .mustRevalidate());

        // [3] 이미지 파일 캐싱
        registry.addResourceHandler("/images/**")
                .addResourceLocations("/images/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS)
                        .cachePublic()
                        .mustRevalidate());

        // [4] 폰트 파일 캐싱
        registry.addResourceHandler("/fonts/**")
                .addResourceLocations("/fonts/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS)
                        .cachePublic()
                        .mustRevalidate());

        // [5] 기타 정적 리소스 캐싱
        registry.addResourceHandler("/static/**")
                .addResourceLocations("/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS)
                        .cachePublic()
                        .mustRevalidate());
    }
}
