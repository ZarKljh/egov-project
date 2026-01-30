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
package egovframework.example.sample.service;

import java.time.LocalDateTime;

/**
 * @Class Name : SampleVO.java
 * @Description : SampleVO Class
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
public class SampleVO extends SampleDefaultVO {

	private static final long serialVersionUID = 1L;

	/** 게시물 고유 아이디 */
	private Long articleId;

	/** 게시물제목 */
	private String title;

	/** 내용 */
	private String content;

	/** 작성자 아이디 */
	private Long userId;
	
	/** 작성자 이름 join쿼리를 이용해서 값을 가져온다 */
	private String username;
	
	
	/** 게시된 민원내용과 관련 서식 아이디 */
	private Long formId;

	/** 상태 */
	private String status;
	
	// 재문의 글의 원문 글 아이디
	private Long rootId = 0L;
	
	/** 재문의 글의 부모 글 아이디 */
	private Long parentArticleId;

	/** 그룹 내 정렬 순서 (추가) */
    private int sortOrder;

    /** 들여쓰기 깊이 (추가) */
    private int dept;
	
	/** 게시물 생성일 */
	private LocalDateTime createdAt;
	
	/** 게시물 수정일 */
	private LocalDateTime updatedAt;
	
	
	/** Getter 와 Setter */
	public Long getArticleId(){
		return this.articleId;
	}
	
	public void setArticleId(Long articleId) {
		this.articleId = articleId;
	}
	
	public String getTitle(){
		return this.title;
	}
	
	public void setTitle(String title) {
		this.title = title;
	}
	
	public String getContent(){
		return this.content;
	}
	
	public void setContent(String content) {
		this.content = content;
	}
	
	public Long getUserId(){
		return this.userId;
	}
	
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	
	public String getUsername() {
		return this.username;
	}
	public void setUsername(String username) {
		this.username = username;
	}

	public Long getFormId(){
		return this.formId;
	}
	
	public void setFormId(Long formId) {
		this.formId = formId;
	}
	
	public String getStatus(){
		return this.status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public Long getRootId() {
	    return rootId;
	}

	public void setRootId(Long rootId) {
	    this.rootId = rootId;
	}
	
	public Long getParentArticleId(){
		return this.parentArticleId;
	}
	
	public void setParentArticleId(Long parentArticleId) {
		this.parentArticleId = parentArticleId;
	}
	
	public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
	
    public int getDept() {
        return dept;
    }

    public void setDept(int dept) {
        this.dept = dept;
    }
    
	public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
	
}
