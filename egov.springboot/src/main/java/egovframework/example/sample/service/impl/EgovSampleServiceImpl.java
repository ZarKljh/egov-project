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
package egovframework.example.sample.service.impl;

import java.util.List;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import egovframework.example.sample.service.EgovSampleService;
import egovframework.example.sample.service.FormsVO;
import egovframework.example.sample.service.SampleDefaultVO;
import egovframework.example.sample.service.SampleVO;
import lombok.RequiredArgsConstructor;

/**
 * @Class Name : EgovSampleServiceImpl.java
 * @Description : Sample Business Implement Class
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

@Service("egovSampleService")
@RequiredArgsConstructor
public class EgovSampleServiceImpl extends EgovAbstractServiceImpl implements EgovSampleService {

	private static final Logger LOGGER = LoggerFactory.getLogger(EgovSampleServiceImpl.class);

	/** SampleDAO */
	private final SampleMapper sampleDAO;

	/** ID Generation */
	private final EgovIdGnrService egovIdGnrService;
	

	/**
	 * 글을 등록한다.
	 * @param vo - 등록할 정보가 담긴 SampleVO
	 * @return 등록 결과
	 * @exception Exception
	 * 
	 * [성능 최적화] @CacheEvict로 목록 캐시 무효화
	 * - 글 등록 시 게시판 목록이 변경되므로 캐시 삭제
	 * - allEntries = true: 해당 캐시의 모든 항목 삭제
	 */
	@Override
	@CacheEvict(value = {"boardList", "boardCount"}, allEntries = true)
	public void insertSample(SampleVO vo) throws Exception {
		LOGGER.debug("입력데이터 확인: " + vo.toString());
		
		if(vo.getParentArticleId() != null && vo.getParentArticleId() > 0) {
			SampleVO searchParentVO = new SampleVO();
			searchParentVO.setArticleId(vo.getParentArticleId());
			SampleVO parentVO = sampleDAO.selectSample(searchParentVO);
			
			if(parentVO != null) {
				// [rootId 설정] 
	            // 부모가 원문이면 부모의 ID를, 부모가 이미 재문의라면 부모가 가진 rootId를 상속받습니다.
	            if (parentVO.getRootId() == 0 || parentVO.getRootId() == null) {
	                vo.setRootId(parentVO.getArticleId()); // 부모가 원문인 경우
	            } else {
	                vo.setRootId(parentVO.getRootId());    // 부모가 이미 답글인 경우 (원문ID 상속)
	            }
				
				vo.setSortOrder(parentVO.getSortOrder()+1);
				vo.setDept(parentVO.getDept()+1);
				sampleDAO.updateSortOrder(vo);
			}
			
			vo.setStatus("REQUERY");
		} else {
			vo.setRootId(0L);
			vo.setParentArticleId(0L);
	        vo.setSortOrder(0);
	        vo.setDept(0);
			vo.setStatus("REGISTER");
		}
		
		
		/** ID Generation Service */
		//String id = egovIdGnrService.getNextStringId();
		//vo.setId(id);
		LOGGER.debug("입력값 가공 후 데이터 : " + vo.toString());

		sampleDAO.insertSample(vo);
		//return id;
	}

	/**
	 * 글을 수정한다.
	 * @param vo - 수정할 정보가 담긴 SampleVO
	 * @return void형
	 * @exception Exception
	 * 
	 * [성능 최적화] @CacheEvict로 관련 캐시 무효화
	 * - 글 수정 시 상세 캐시와 목록 캐시 모두 무효화
	 * - beforeInvocation = false: 메서드 성공 시에만 캐시 삭제
	 */
	@Override
	@CacheEvict(value = {"boardList", "boardDetail", "boardCount"}, allEntries = true)
	public void updateSample(SampleVO vo) throws Exception {
		sampleDAO.updateSample(vo);
	}

	/**
	 * 글을 삭제한다.
	 * @param vo - 삭제할 정보가 담긴 SampleVO
	 * @return void형
	 * @exception Exception
	 * 
	 * [성능 최적화] @CacheEvict로 관련 캐시 무효화
	 * - 글 삭제 시 상세 캐시와 목록 캐시 모두 무효화
	 */
	@Override
	@CacheEvict(value = {"boardList", "boardDetail", "boardCount"}, allEntries = true)
	public void deleteSample(SampleVO vo) throws Exception {
		sampleDAO.deleteSample(vo);
	}

	/**
	 * 글을 조회한다.
	 * @param vo - 조회할 정보가 담긴 SampleVO
	 * @return 조회한 글
	 * @exception Exception
	 * 
	 * [성능 최적화] @Cacheable로 상세 조회 결과 캐싱
	 * - 캐시 키: articleId (게시글 ID)
	 * - 동일한 게시글 조회 시 DB 조회 없이 캐시에서 반환
	 * - 예상 성능 개선: 0.3초 → 0.01초
	 */
	@Override
	@Cacheable(value = "boardDetail", key = "#vo.articleId")
	public SampleVO selectSample(SampleVO vo) throws Exception {
		SampleVO resultVO = sampleDAO.selectSample(vo);
		if (resultVO == null)
			throw processException("info.nodata.msg");
		return resultVO;
	}

	/**
	 * 글 목록을 조회한다.
	 * @param searchVO - 조회할 정보가 담긴 VO
	 * @return 글 목록
	 * @exception Exception
	 */
	@Override
	public List<?> selectSampleList(SampleDefaultVO searchVO) throws Exception {
		return sampleDAO.selectSampleList(searchVO);
	}

	/**
	 * 글 총 갯수를 조회한다.
	 * @param searchVO - 조회할 정보가 담긴 VO
	 * @return 글 총 갯수
	 * @exception
	 * 
	 * [성능 최적화] @Cacheable로 총 개수 조회 결과 캐싱
	 * - 캐시 키: 검색 조건 조합
	 * - 동일한 검색 조건 조회 시 DB COUNT 쿼리 없이 캐시에서 반환
	 * - 예상 성능 개선: 0.3초 → 0.01초
	 */
	@Override
	@Cacheable(value = "boardCount", key = "#searchVO.searchCondition + '_' + #searchVO.searchKeyword")
	public int selectSampleListTotCnt(SampleDefaultVO searchVO) {
		return sampleDAO.selectSampleListTotCnt(searchVO);
	}
	
	@Override
	public List<FormsVO> selectFormsList() throws Exception {
		return sampleDAO.selectFormsList();
	}
	
	/**
	 * 게시글 상태를 변경한다.
	 * @param articleId - 변경할 게시글 ID
	 * @param status - 변경할 상태 (REGISTER, ANSWERED, HOLD, DELETE 등)
	 * @exception Exception
	 * 
	 * [성능 최적화] @CacheEvict로 관련 캐시 무효화
	 * - 상태 변경 시 상세 캐시와 목록 캐시 모두 무효화
	 */
	@Override
	@CacheEvict(value = {"boardList", "boardDetail", "boardCount"}, allEntries = true)
	public void updateArticleStatus(Long articleId, String status) throws Exception {
		sampleDAO.updateArticleStatus(articleId, status);
	}

}
