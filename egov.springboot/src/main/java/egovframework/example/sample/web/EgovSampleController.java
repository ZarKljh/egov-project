/*
 * Copyright 2008-2009 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package egovframework.example.sample.web;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.egovframe.rte.fdl.property.EgovPropertyService;
import org.egovframe.rte.ptl.mvc.tags.ui.pagination.PaginationInfo;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.support.SessionStatus;
import org.springmodules.validation.commons.DefaultBeanValidator;

import egovframework.com.cmm.util.JwtUtil;
import egovframework.example.sample.service.AnswerService;
import egovframework.example.sample.service.EgovSampleService;
import egovframework.example.sample.service.FormsVO;
import egovframework.example.sample.service.SampleDefaultVO;
import egovframework.example.sample.service.SampleVO;
import lombok.RequiredArgsConstructor;

/**
 * @Class Name : EgovSampleController.java
 * @Description : EgovSample Controller Class
 * @Modification Information
 * @
 * @  수정일      수정자              수정내용
 * @ ---------   ---------   -------------------------------
 * @ 2009.03.16           최초생성
 *
 * @author 개발프레임웍크 실행환경 개발팀
 * @since 2009. 03.16
 * @version 1.0
 * @see
 *
 *  Copyright (C) by MOPAS All right reserved.
 */

@Controller
@RequiredArgsConstructor
public class EgovSampleController {

	/** EgovSampleService */
	private final EgovSampleService sampleService;

	/** EgovPropertyService */
	private final EgovPropertyService propertiesService;

	/** Validator */
	private final DefaultBeanValidator beanValidator;
	
	/** AnswerService */
	@Resource(name = "answerService")
	private AnswerService answerService;

	/**
	 * 글 목록을 조회한다. (pageing)
	 * @param searchVO - 조회할 정보가 담긴 SampleDefaultVO
	 * @param model
	 * @return "egovSampleList"
	 * @exception Exception
	 */
	@GetMapping("/egovSampleList.do")
	public String selectSampleList(@ModelAttribute("searchVO") SampleDefaultVO searchVO, ModelMap model) throws Exception {

		/** EgovPropertyService.sample */
		searchVO.setPageUnit(propertiesService.getInt("pageUnit"));
		searchVO.setPageSize(propertiesService.getInt("pageSize"));

		/** pageing setting */
		PaginationInfo paginationInfo = new PaginationInfo();
		paginationInfo.setCurrentPageNo(searchVO.getPageIndex());
		paginationInfo.setRecordCountPerPage(searchVO.getPageUnit());
		paginationInfo.setPageSize(searchVO.getPageSize());

		searchVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
		searchVO.setLastIndex(paginationInfo.getLastRecordIndex());
		searchVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

		List<?> sampleList = sampleService.selectSampleList(searchVO);
		model.addAttribute("resultList", sampleList);

		int totCnt = sampleService.selectSampleListTotCnt(searchVO);
		paginationInfo.setTotalRecordCount(totCnt);
		model.addAttribute("paginationInfo", paginationInfo);

		return "sample/egovSampleList";
	}

	/**
	 * 글 등록 화면을 조회한다.
	 * @param searchVO - 목록 조회조건 정보가 담긴 VO
	 * @param model
	 * @return "egovSampleRegister"
	 * @exception Exception
	 */
	

	
	@GetMapping("/addSample.do")
	public String addSampleRequery(HttpServletRequest request, @RequestParam(value="parentArticleId", required=false) Long parentId, @ModelAttribute("searchVO") SampleDefaultVO searchVO, Model model) throws Exception {
		System.out.println("▶▶▶ 재문의 컨트롤러 진입 성공! parentId: " + parentId);
		SampleVO vo = new SampleVO();
		if(parentId != null && parentId > 0) {
			vo.setParentArticleId(parentId);
			vo.setTitle("[재문의]");
		} else {
			vo.setParentArticleId(null);
		}
		String username = JwtUtil.getUsername(request);
		vo.setUsername(username != null && !username.isEmpty() ? username : "임시사용자");
		model.addAttribute("sampleVO", vo);
		model.addAttribute("registerFlag", "create");
		model.addAttribute("searchVO", searchVO);
		return "sample/egovSampleRegister";
	}
	
	
	/**
	 * 글을 등록한다.
	 * @param sampleVO - 등록할 정보가 담긴 VO
	 * @param searchVO - 목록 조회조건 정보가 담긴 VO
	 * @param status
	 * @return "forward:/egovSampleList.do"
	 * @exception Exception
	 */
	@PostMapping("/addSample.do")
	public String addSample(HttpServletRequest request, @ModelAttribute("searchVO") SampleDefaultVO searchVO, SampleVO sampleVO, BindingResult bindingResult, Model model, SessionStatus status)
			throws Exception {

		// Server-Side Validation
		beanValidator.validate(sampleVO, bindingResult);

		if (bindingResult.hasErrors()) {
			model.addAttribute("sampleVO", sampleVO);
			return "sample/egovSampleRegister";
		}
		
		// JWT에서 userId 추출, 없으면 1L (임시)
		String userIdStr = JwtUtil.getUserId(request);
		Long userId = 1L;
		if (userIdStr != null && !userIdStr.isEmpty()) {
			try {
				userId = Long.parseLong(userIdStr);
			} catch (NumberFormatException ignored) {
			}
		}
		sampleVO.setUserId(userId);
	
		sampleService.insertSample(sampleVO);
		status.setComplete();
		
		model.addAttribute("searchCondition", sampleVO.getSearchCondition());
		model.addAttribute("searchKeyword", sampleVO.getSearchKeyword());
		model.addAttribute("pageIndex", sampleVO.getPageIndex());
		
		return "redirect:/egovSampleList.do";
	}

	/**
	 * 글 수정화면을 조회한다.
	 * @param id - 수정할 글 id
	 * @param searchVO - 목록 조회조건 정보가 담긴 VO
	 * @param model
	 * @return "egovSampleRegister"
	 * @exception Exception
	 */
	@GetMapping("/updateSampleView.do")
	public String updateSampleView(@RequestParam("articleId") Long articleId, @ModelAttribute("searchVO") SampleDefaultVO searchVO, Model model, HttpServletRequest request) throws Exception {
		SampleVO sampleVO = new SampleVO();
		//sampleVO.setId(id);
		sampleVO.setArticleId(articleId);
		SampleVO result = sampleService.selectSample(sampleVO);
		// 변수명은 CoC 에 따라 sampleVO
		//model.addAttribute(selectSample(sampleVO, searchVO));
		model.addAttribute("sampleVO", result);
		model.addAttribute("searchVO", searchVO);
		
		// 사용자 권한 정보 추가 (JwtUtil 재사용)
		String userRole = JwtUtil.getUserRole(request);
		model.addAttribute("userRole", userRole);
		
		// 답변 목록 조회
		try {
			List<?> answerList = answerService.selectAnswerList(articleId.intValue());
			model.addAttribute("answerList", answerList);
		} catch (Exception e) {
			System.err.println("답변 목록 조회 중 오류: " + e.getMessage());
			// 답변 목록 조회 실패해도 게시글은 표시
		}
		
		// 민원 서식 목록 조회
		try {
			List<FormsVO> formsList = sampleService.selectFormsList();
			model.addAttribute("formsList", formsList);
		} catch (Exception e) {
			System.err.println("서식 목록 조회 중 오류: " + e.getMessage());
			// 서식 목록 조회 실패해도 게시글은 표시
		}
		
		return "sample/egovSampleRegister";
	}

	/**
	 * 글을 조회한다.
	 * @param sampleVO - 조회할 정보가 담긴 VO
	 * @param searchVO - 목록 조회조건 정보가 담긴 VO
	 * @param status
	 * @return @ModelAttribute("sampleVO") - 조회한 정보
	 * @exception Exception
	 */
	public SampleVO selectSample(SampleVO sampleVO, @ModelAttribute("searchVO") SampleDefaultVO searchVO) throws Exception {
		return sampleService.selectSample(sampleVO);
	}

	/**
	 * 글을 수정한다.
	 * @param sampleVO - 수정할 정보가 담긴 VO
	 * @param searchVO - 목록 조회조건 정보가 담긴 VO
	 * @param status
	 * @return "forward:/egovSampleList.do"
	 * @exception Exception
	 */
	@PostMapping("/updateSample.do")
	public String updateSample(@ModelAttribute("searchVO") SampleDefaultVO searchVO, SampleVO sampleVO, BindingResult bindingResult, Model model, SessionStatus status)
			throws Exception {

		beanValidator.validate(sampleVO, bindingResult);

		if (bindingResult.hasErrors()) {
			model.addAttribute("sampleVO", sampleVO);
			return "sample/egovSampleRegister";
		}

		sampleService.updateSample(sampleVO);
		status.setComplete();
		
		model.addAttribute("searchCondition", sampleVO.getSearchCondition());
		model.addAttribute("searchKeyword", sampleVO.getSearchKeyword());
		model.addAttribute("pageIndex", sampleVO.getPageIndex());
		
		return "redirect:/egovSampleList.do";
	}

	/**
	 * 글을 삭제한다.
	 * @param sampleVO - 삭제할 정보가 담긴 VO
	 * @param searchVO - 목록 조회조건 정보가 담긴 VO
	 * @param status
	 * @return "forward:/egovSampleList.do"
	 * @exception Exception
	 */
	@PostMapping("/deleteSample.do")
	public String deleteSample(SampleVO sampleVO, @ModelAttribute("searchVO") SampleDefaultVO searchVO, Model model, SessionStatus status) throws Exception {
		sampleService.deleteSample(sampleVO);
		status.setComplete();
		
		model.addAttribute("searchCondition", sampleVO.getSearchCondition());
		model.addAttribute("searchKeyword", sampleVO.getSearchKeyword());
		model.addAttribute("pageIndex", sampleVO.getPageIndex());
		
		return "redirect:/egovSampleList.do";
	}
	
	@GetMapping("/getSample.do")
	public String getSample(@RequestParam("articleId") Long articleId, @ModelAttribute("searchVO") SampleDefaultVO searchVO, Model model) throws Exception {
	    SampleVO sampleVO = new SampleVO();
	    sampleVO.setArticleId(articleId);
	    SampleVO result = sampleService.selectSample(sampleVO);
	    model.addAttribute("sampleVO", result);
	    model.addAttribute("searchVO", searchVO);
	    
	    // 답변 목록도 함께 조회
	    try {
			List<?> answerList = answerService.selectAnswerList(articleId.intValue());
			model.addAttribute("answerList", answerList);
		} catch (Exception e) {
			System.err.println("답변 목록 조회 중 오류: " + e.getMessage());
			// 답변 목록 조회 실패해도 게시글은 표시
		}
	    
	    return "sample/egovSampleRegister";
	}
}
