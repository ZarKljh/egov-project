package egovframework.example.sample.web;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import egovframework.example.sample.service.AnswerService;
import egovframework.example.sample.service.AnswerVO;
import egovframework.example.sample.service.EgovSampleService;
import egovframework.example.sample.service.SampleVO;

@Controller
public class AnswerController {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(AnswerController.class);
	
	private EgovSampleService sampleService;
	
	@Resource(name = "answerService")
    private AnswerService answerService;
	
	/**
     * 관리자 답변 등록 처리
     */
    @RequestMapping(value = "/addAnswer.do", method = RequestMethod.POST)
    public String addAnswer(
            @RequestParam("articleId") int articleId,
            @RequestParam(value = "formId", required = false) String formIdStr,
            @RequestParam("content") String content,
            @RequestParam(value = "answerId", required = false) String answerIdStr,
            HttpServletRequest request) throws Exception {
        
        LOGGER.info("=== Answer 등록 시작 ===");
        LOGGER.info("요청 파라미터 - articleId: {}, formId: {}, content: {}, answerId: {}", 
                articleId, formIdStr, content, answerIdStr);
        
        // 1. 보안 및 유효성 체크
        Object userIdObj = request.getAttribute("userId");
        Object userRoleObj = request.getAttribute("userRole");
        
        LOGGER.info("인증 정보 - userId: {}, userRole: {}", userIdObj, userRoleObj);
        
        // 인증 체크
        if (userIdObj == null) {
            LOGGER.warn("인증 실패: userId가 null입니다.");
        	return "redirect:/login.do";
        }
        
        // ADMIN 권한 체크
        if (userRoleObj == null || !"ADMIN".equals(userRoleObj.toString())) {
            LOGGER.warn("권한 없음: userRole={}", userRoleObj);
        	return "redirect:/egovSampleList.do?error=관리자만 답변을 등록할 수 있습니다";
        }

        // 필수 필드 검증
        if (articleId == 0) {
            LOGGER.error("ERROR: articleId가 0입니다!");
            return "redirect:/egovSampleList.do?error=게시글 정보가 올바르지 않습니다.";
        }
        
        if (content == null || content.trim().isEmpty()) {
            LOGGER.warn("답변 내용이 비어있습니다.");
            return "redirect:/updateSampleView.do?articleId=" + articleId + "&error=답변 내용을 입력해주세요.";
        }

        // AnswerVO 생성 및 값 설정
        AnswerVO answerVO = new AnswerVO();
        answerVO.setArticleId(articleId);
        answerVO.setUserId(Integer.parseInt(userIdObj.toString()));
        answerVO.setContent(content);
        
        // formId 처리 (빈 문자열이면 null, 아니면 Integer로 변환)
        if (formIdStr != null && !formIdStr.trim().isEmpty()) {
            try {
                int formId = Integer.parseInt(formIdStr);
                answerVO.setFormId(formId > 0 ? formId : null);
            } catch (NumberFormatException e) {
                LOGGER.warn("formId 변환 실패: {}, null로 설정", formIdStr);
                answerVO.setFormId(null);
            }
        } else {
            answerVO.setFormId(null);
        }
        
        // answerId 처리 (수정 모드인 경우)
        if (answerIdStr != null && !answerIdStr.trim().isEmpty()) {
            try {
                answerVO.setAnswerId(Integer.parseInt(answerIdStr));
            } catch (NumberFormatException e) {
                LOGGER.warn("answerId 변환 실패: {}", answerIdStr);
            }
        }
        
        LOGGER.info("AnswerVO 최종 설정 - articleId: {}, userId: {}, formId: {}, content: {}", 
                answerVO.getArticleId(), answerVO.getUserId(), answerVO.getFormId(), answerVO.getContent());

        // 3. 답변 저장 서비스 호출 
        try {
            LOGGER.info("답변 저장 서비스 호출 시작");
            answerService.insertAnswer(answerVO);
            LOGGER.info("답변 등록 성공!");
        } catch (Exception e) {
            LOGGER.error("답변 등록 중 오류 발생: {}", e.getMessage(), e);
            return "redirect:/updateSampleView.do?articleId=" + articleId + "&error=답변 등록 중 오류가 발생했습니다: " + e.getMessage();
        }

        // 4. 처리 후 해당 게시글 상세 페이지로 리다이렉트
        LOGGER.info("답변 등록 완료, 리다이렉트: /updateSampleView.do?articleId={}", articleId);
        return "redirect:/updateSampleView.do?articleId=" + articleId;
    }
	
}
