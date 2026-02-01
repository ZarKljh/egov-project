package egovframework.example.sample.web;

import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;

import egovframework.com.cmm.util.JwtUtil;
import egovframework.example.sample.service.AnswerService;
import egovframework.example.sample.service.AnswerVO;
import egovframework.example.sample.service.EgovSampleService;
import egovframework.example.sample.service.FormsVO;
import egovframework.example.sample.service.SampleDefaultVO;
import egovframework.example.sample.service.SampleVO;

/**
 * 민원문의처리 REST API Controller
 * 
 * [MVC 패턴 준수]
 * - Controller: 요청/응답 처리만 담당
 * - Service: 비즈니스 로직 처리 (상태 변경, 트랜잭션 등)
 * - Mapper: 데이터베이스 쿼리 실행
 * 
 * [RBAC]
 * - 모든 엔드포인트는 ADMIN 권한 필요
 * - JWT 토큰을 헤더에서 추출하여 권한 검증
 */
/**
 * CORS는 WebMvcConfig에서 globals.properties의 cors.allowed.origins 로 전역 설정됨.
 */
@Controller
public class EgovComplaintApiController {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(EgovComplaintApiController.class);
	
	// #region agent log
	static {
		try {
			FileWriter fw = new FileWriter("d:\\si-project\\workspace-egov\\.cursor\\debug.log", true);
			fw.write("{\"timestamp\":" + System.currentTimeMillis() + ",\"location\":\"EgovComplaintApiController:static\",\"message\":\"클래스 로드됨\",\"data\":{\"class\":\"EgovComplaintApiController\"},\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"A\"}\n");
			fw.close();
		} catch (IOException e) {}
	}
	// #endregion
	
	@Resource(name = "egovSampleService")
	private EgovSampleService sampleService;
	
	@Resource(name = "answerService")
	private AnswerService answerService;
	
	@javax.annotation.Resource
	private RestTemplate restTemplate;
		
	@PostConstruct
	public void init() {
		// #region agent log
		try {
			FileWriter fw = new FileWriter("d:\\si-project\\workspace-egov\\.cursor\\debug.log", true);
			fw.write("{\"timestamp\":" + System.currentTimeMillis() + ",\"location\":\"EgovComplaintApiController:init\",\"message\":\"@PostConstruct 실행됨\",\"data\":{},\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"B\"}\n");
			fw.close();
		} catch (IOException e) {}
		// #endregion
		LOGGER.info("=========================================");
		LOGGER.info("EgovComplaintApiController 초기화됨!");
		LOGGER.info("=========================================");
		System.out.println("=========================================");
		System.out.println("EgovComplaintApiController 초기화됨!");
		System.out.println("=========================================");
	}
	
	/**
	 * 민원 목록 조회
	 * GET /api/complaints?status=REGISTER&page=1&size=10
	 */
	@GetMapping("/complaints")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getComplaintList(
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String searchKeyword,
			@RequestParam(required = false) Integer searchCondition,
			@RequestParam(required = false) String dateFilter,
			@RequestParam(required = false) String sortOrder,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size,
			HttpServletRequest request) {
		// #region agent log
		try {
			FileWriter fw = new FileWriter("d:\\si-project\\workspace-egov\\.cursor\\debug.log", true);
			fw.write("{\"timestamp\":" + System.currentTimeMillis() + ",\"location\":\"EgovComplaintApiController:getComplaintList\",\"message\":\"메서드 호출됨\",\"data\":{\"page\":" + page + ",\"size\":" + size + ",\"status\":\"" + (status != null ? status : "null") + "\"},\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"C\"}\n");
			fw.close();
		} catch (IOException e) {}
		// #endregion
		LOGGER.info("[DEBUG] getComplaintList 호출됨 - page: {}, size: {}, status: {}", page, size, status);
		System.out.println("[DEBUG] getComplaintList 호출됨 - page: " + page + ", size: " + size + ", status: " + status);
		
		// 권한 검증
		String userRole = JwtUtil.getUserRole(request);
		if (!"ADMIN".equals(userRole)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("error", "접근 권한이 없습니다."));
		}
		
		try {
			// 검색 조건 설정
			SampleDefaultVO searchVO = new SampleDefaultVO();
			searchVO.setPageIndex(page - 1); // MyBatis는 0부터 시작
			searchVO.setRecordCountPerPage(size);
			
			if (searchKeyword != null && !searchKeyword.isEmpty()) {
				searchVO.setSearchKeyword(searchKeyword);
				// searchCondition: 0=제목, 1=내용, 2=작성자
				searchVO.setSearchCondition(searchCondition != null ? String.valueOf(searchCondition) : "0");
			}
			
			// 상태 필터 적용
			if (status != null && !status.isEmpty()) {
				searchVO.setStatus(status);
			}
			
			// 날짜 필터 적용
			if (dateFilter != null && !dateFilter.isEmpty()) {
				searchVO.setDateFilter(dateFilter);
			}
			
			// 정렬 적용
			if (sortOrder != null && !sortOrder.isEmpty()) {
				searchVO.setOrderDirection(sortOrder);
			}
			
			List<?> list = sampleService.selectSampleList(searchVO);
			int totalCnt = sampleService.selectSampleListTotCnt(searchVO);
			
			Map<String, Object> response = new HashMap<>();
			response.put("list", list);
			response.put("totalCnt", totalCnt);
			response.put("page", page);
			response.put("size", size);
			
			return ResponseEntity.ok(response);
			
		} catch (Exception e) {
			LOGGER.error("민원 목록 조회 실패", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "민원 목록 조회 중 오류가 발생했습니다."));
		}
	}
	
	/**
	 * 민원 서식 목록 조회
	 * GET /api/forms
	 */
	@GetMapping("/forms")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getFormsList(
			HttpServletRequest request) {
		
		// 권한 검증
		String userRole = JwtUtil.getUserRole(request);
		if (!"ADMIN".equals(userRole)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("error", "접근 권한이 없습니다."));
		}
		
		try {
			List<FormsVO> formsList = sampleService.selectFormsList();
			
			// FormsVO를 Map으로 변환 (LocalDateTime을 String으로 변환)
			DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
			List<Map<String, Object>> formsDto = new ArrayList<>();
			for (FormsVO form : formsList) {
				Map<String, Object> formDto = new HashMap<>();
				formDto.put("formId", form.getFormId());
				formDto.put("formName", form.getFormName());
				formDto.put("description", form.getDescription());
				formDto.put("downloadable", form.isDownloadable());
				if (form.getCreatedAt() != null) {
					formDto.put("createdAt", form.getCreatedAt().format(formatter));
				} else {
					formDto.put("createdAt", null);
				}
				formsDto.add(formDto);
			}
			
			Map<String, Object> response = new HashMap<>();
			response.put("list", formsDto);
			
			return ResponseEntity.ok(response);
			
		} catch (Exception e) {
			LOGGER.error("서식 목록 조회 실패", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "서식 목록 조회 중 오류가 발생했습니다."));
		}
	}
	
	/**
	 * 민원 상세 조회
	 * GET /complaints/{id}
	 */
	@GetMapping("/complaints/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getComplaintDetail(
			@PathVariable Long id,
			HttpServletRequest request) {
		
		// 권한 검증
		String userRole = JwtUtil.getUserRole(request);
		if (!"ADMIN".equals(userRole)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("error", "접근 권한이 없습니다."));
		}
		
		try {
			// 게시글 조회
			SampleVO sampleVO = new SampleVO();
			sampleVO.setArticleId(id);
			SampleVO article = sampleService.selectSample(sampleVO);
			
			if (article == null) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(Map.of("error", "민원을 찾을 수 없습니다."));
			}
			
			// 답변 목록 조회
			List<AnswerVO> answers = answerService.selectAnswerList(id.intValue());
			
			// LocalDateTime을 String으로 변환하는 DateTimeFormatter
			DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
			
			// Article 응답 DTO 생성 (LocalDateTime을 String으로 변환)
			Map<String, Object> articleDto = new HashMap<>();
			articleDto.put("articleId", article.getArticleId());
			articleDto.put("title", article.getTitle());
			articleDto.put("content", article.getContent());
			articleDto.put("userId", article.getUserId());
			articleDto.put("username", article.getUsername());
			articleDto.put("formId", article.getFormId());
			articleDto.put("status", article.getStatus());
			articleDto.put("rootId", article.getRootId());
			articleDto.put("parentArticleId", article.getParentArticleId());
			articleDto.put("sortOrder", article.getSortOrder());
			articleDto.put("dept", article.getDept());
			// LocalDateTime을 String으로 변환
			if (article.getCreatedAt() != null) {
				articleDto.put("createdAt", article.getCreatedAt().format(formatter));
			} else {
				articleDto.put("createdAt", null);
			}
			if (article.getUpdatedAt() != null) {
				articleDto.put("updatedAt", article.getUpdatedAt().format(formatter));
			} else {
				articleDto.put("updatedAt", null);
			}
			
			// Answers 응답 DTO 리스트 생성 (LocalDateTime을 String으로 변환)
			List<Map<String, Object>> answersDto = new ArrayList<>();
			for (AnswerVO answer : answers) {
				Map<String, Object> answerDto = new HashMap<>();
				answerDto.put("answerId", answer.getAnswerId());
				answerDto.put("articleId", answer.getArticleId());
				answerDto.put("userId", answer.getUserId());
				answerDto.put("formId", answer.getFormId());
				answerDto.put("content", answer.getContent());
				answerDto.put("adminName", answer.getAdminName());
				answerDto.put("formName", answer.getFormName());
				// LocalDateTime을 String으로 변환
				if (answer.getCreatedAt() != null) {
					answerDto.put("createdAt", answer.getCreatedAt().format(formatter));
				} else {
					answerDto.put("createdAt", null);
				}
				if (answer.getUpdatedAt() != null) {
					answerDto.put("updatedAt", answer.getUpdatedAt().format(formatter));
				} else {
					answerDto.put("updatedAt", null);
				}
				answersDto.add(answerDto);
			}
			
			Map<String, Object> response = new HashMap<>();
			response.put("article", articleDto);
			response.put("answers", answersDto);
			
			return ResponseEntity.ok(response);
			
		} catch (Exception e) {
			LOGGER.error("민원 상세 조회 실패: articleId={}", id, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "민원 상세 조회 중 오류가 발생했습니다."));
		}
	}
	
	/**
	 * 답변 등록 및 상태 변경
	 * POST /api/complaints/{id}/answer
	 * 
	 * [MVC 패턴]
	 * - Controller: 요청 데이터 검증 및 Service 호출
	 * - Service: 답변 등록 및 상태 변경 로직 처리 (트랜잭션)
	 */
	@PostMapping("/complaints/{id}/answer")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> saveAnswer(
			@PathVariable Long id,
			@RequestBody Map<String, String> requestBody,
			HttpServletRequest request) {
		
		// 권한 검증
		String userRole = JwtUtil.getUserRole(request);
		if (!"ADMIN".equals(userRole)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("error", "접근 권한이 없습니다."));
		}
		
		try {
			String content = requestBody.get("content");
			if (content == null || content.trim().isEmpty()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(Map.of("error", "답변 내용을 입력해주세요."));
			}
			
			// 사용자 ID 추출
			String userIdStr = JwtUtil.getUserId(request);
			if (userIdStr == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Map.of("error", "인증 정보가 없습니다."));
			}
			
			// AnswerVO 생성
			AnswerVO answerVO = new AnswerVO();
			answerVO.setArticleId(id.intValue());
			answerVO.setUserId(Integer.parseInt(userIdStr));
			answerVO.setContent(content);
			
			// formId가 있으면 설정
			if (requestBody.containsKey("formId") && requestBody.get("formId") != null) {
				try {
					answerVO.setFormId(Integer.parseInt(requestBody.get("formId")));
				} catch (NumberFormatException e) {
					// formId가 숫자가 아니면 null로 설정
					answerVO.setFormId(null);
				}
			}
			
			// Service 호출: 답변 등록 및 상태 변경 (트랜잭션 처리)
			answerService.insertAnswer(answerVO);
			
			// Service에서 이미 상태를 ANSWERED로 변경하므로 추가 작업 불필요
			// AnswerServiceImpl.insertAnswer()가 answerMapper.updateArticleStatusToAnswered() 호출
			
			return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "답변이 등록되었습니다."
			));
			
		} catch (Exception e) {
			LOGGER.error("답변 등록 실패: articleId={}", id, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "답변 등록 중 오류가 발생했습니다."));
		}
	}
	
	/**
	 * 민원 상태 변경
	 * PATCH /api/complaints/{id}/status
	 * 
	 * [MVC 패턴]
	 * - Controller: 요청 데이터 검증 및 Service 호출
	 * - Service: 상태 변경 로직 처리 (비즈니스 로직)
	 */
	@PatchMapping("/complaints/{id}/status")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> updateStatus(
			@PathVariable Long id,
			@RequestBody Map<String, String> requestBody,
			HttpServletRequest request) {
		
		// 권한 검증
		String userRole = JwtUtil.getUserRole(request);
		if (!"ADMIN".equals(userRole)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("error", "접근 권한이 없습니다."));
		}
		
		try {
			String status = requestBody.get("status");
			if (status == null || status.trim().isEmpty()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(Map.of("error", "상태 값을 입력해주세요."));
			}
			
			// 유효한 상태 값 검증
			if (!status.matches("REGISTER|ANSWERED|HOLD|DELETE")) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(Map.of("error", "유효하지 않은 상태 값입니다."));
			}
			
			// Service 호출: 상태 변경 (비즈니스 로직)
			sampleService.updateArticleStatus(id, status);
			
			return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "상태가 변경되었습니다.",
					"status", status
			));
			
		} catch (Exception e) {
			LOGGER.error("상태 변경 실패: articleId={}", id, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "상태 변경 중 오류가 발생했습니다."));
		}
	}
	
	/**
	 * 민원 논리 삭제
	 * DELETE /api/complaints/{id}
	 * 
	 * [MVC 패턴]
	 * - Controller: 요청 검증 및 Service 호출
	 * - Service: 논리 삭제 로직 처리 (상태를 DELETE로 변경)
	 */
	@DeleteMapping("/complaints/{id}")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> deleteComplaint(
			@PathVariable Long id,
			HttpServletRequest request) {
		
		// 권한 검증
		String userRole = JwtUtil.getUserRole(request);
		if (!"ADMIN".equals(userRole)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("error", "접근 권한이 없습니다."));
		}
		
		try {
			// Service 호출: 논리 삭제 (상태를 DELETE로 변경)
			sampleService.updateArticleStatus(id, "DELETE");
			
			return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "민원이 삭제되었습니다."
			));
			
		} catch (Exception e) {
			LOGGER.error("민원 삭제 실패: articleId={}", id, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "민원 삭제 중 오류가 발생했습니다."));
		}
	}
	
	@PostMapping("/complaints/{id}/draft")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> generateDraft(
			@PathVariable Long id, 
			HttpServletRequest request){
	
		String userRole = JwtUtil.getUserRole(request);
		if (!"ADMIN".equals(userRole)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error","접근 권한이 없습니다"));
		}
		
		try {
			SampleVO sampleVO = new SampleVO();
			sampleVO.setArticleId(id);
			SampleVO article = sampleService.selectSample(sampleVO);
			if (article == null) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error","민원을 찾을 수 없습니다"));
			}
			
			String apiKey = null;
			try(InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream("egovframework/egovProps/globals.properties")){
				if (is != null) {
					Properties props = new Properties();
					props.load(is);
					apiKey = props.getProperty("GEMINI_API_KEY");
				}
			}
			if (apiKey == null || apiKey.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(Map.of("error", "Gemini API 키가 설정되지 않았습니다."));
	        }
			
			String title = article.getTitle() != null ? article.getTitle() : "";
			String content = article.getContent() !=null ? article.getContent() : "";
			String prompt = "아래 민원에 대한 공공기관 답변 초안을 하나만 작성해 주세요. 존댓말로 간결하게 작성하세요.\n\n" + 
	                "[제목]\n" + title + "\n\n" + 
	                "[내용]\n" + content;
					
			String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=" + apiKey;
	        Map<String, Object> requestBody = new HashMap<>();
	        List<Map<String, Object>> contents = new ArrayList<>();
	        Map<String, Object> contentItem = new HashMap<>();
	        List<Map<String, Object>> parts = new ArrayList<>();
	        Map<String, Object> part = new HashMap<>();
	        part.put("text", prompt);
	        parts.add(part);
	        contentItem.put("parts", parts);
	        contents.add(contentItem);
	        requestBody.put("contents", contents);

	        @SuppressWarnings("unchecked")
	        Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
	        if (response == null) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(Map.of("error", "AI 초안 생성에 실패했습니다."));
	        }

	        List<?> candidates = (List<?>) response.get("candidates");
	        if (candidates == null || candidates.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(Map.of("error", "AI 초안 생성에 실패했습니다."));
	        }
	        Map<?, ?> first = (Map<?, ?>) candidates.get(0);
	        Map<?, ?> contentMap = (Map<?, ?>) first.get("content");
	        if (contentMap == null) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(Map.of("error", "AI 초안 생성에 실패했습니다."));
	        }
	        List<?> partsList = (List<?>) contentMap.get("parts");
	        if (partsList == null || partsList.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(Map.of("error", "AI 초안 생성에 실패했습니다."));
	        }
	        Map<?, ?> textPart = (Map<?, ?>) partsList.get(0);
	        String draft = textPart.get("text") != null ? textPart.get("text").toString().trim() : "";

	        return ResponseEntity.ok(Map.of("draft", draft));
			
		} catch(Exception e) {
			 LOGGER.error("AI 초안 생성 실패: articleId={}", id, e);
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "AI 초안 생성 중 오류가 발생했습니다."));
		               
		}
	}
	
}
