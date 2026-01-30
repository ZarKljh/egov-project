package egovframework.example.sample.web;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import egovframework.com.cmm.util.JwtUtil;
import io.jsonwebtoken.Claims;

@Controller
public class EgovAuthApiController {
	@RequestMapping(value = "/checkAuth.do")
    @ResponseBody
    public ResponseEntity<String> checkAuth(HttpServletRequest request) {
        
		// 인터셉터를 거치지 않으므로 직접 토큰 검증
        String token = JwtUtil.resolveToken(request);
		
        if (token == null || token.isEmpty()) {
            // 토큰이 없으면 401 Unauthorized 반환
            return new ResponseEntity<>("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
        }
        
        try {
        	Claims claims = JwtUtil.validateAndParseToken(token);
        	//String userId = claims.get("userId",String.class);
        	String userRole = claims.get("role", String.class);
        	
        	if(userRole == null || !"ADMIN".equals(userRole)) {
        		return new ResponseEntity<>("FORBIDDEN", HttpStatus.FORBIDDEN);
        	}
        	
        	return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
        	
        } catch (Exception e) {
        	return new ResponseEntity<>("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
        }
        
    }
}
