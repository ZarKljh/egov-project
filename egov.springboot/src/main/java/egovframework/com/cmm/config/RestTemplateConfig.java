package egovframework.com.cmm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

//이 클래스는 “설정용”이고, 안에 있는 @Bean 메서드들이 Spring에 등록된다
@Configuration
public class RestTemplateConfig {
    
    //restTemplate()이 반환하는 RestTemplate 객체를 Spring이 관리하게 한다.
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}