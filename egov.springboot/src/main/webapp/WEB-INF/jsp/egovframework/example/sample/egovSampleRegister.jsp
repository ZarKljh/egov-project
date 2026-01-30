<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c"         uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt"       uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="form"      uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="validator" uri="http://www.springmodules.org/tags/commons-validator" %>
<%@ taglib prefix="spring"    uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="fn"        uri="http://java.sun.com/jsp/jstl/functions" %>
<%
  /**
  * @Class Name : egovSampleRegister.jsp
  * @Description : Sample Register 화면
  * @Modification Information
  *
  *   수정일         수정자                   수정내용
  *  -------    --------    ---------------------------
  *  2009.02.01            최초 생성
  *
  * author 실행환경 개발팀
  * since 2009.02.01
  *
  * Copyright (C) 2009 by MOPAS  All right reserved.
  */
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko" xml:lang="ko">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <c:set var="registerFlag" value="${empty sampleVO.articleId or sampleVO.articleId == 0 ? 'create' : 'modify'}"/>
    <title>Sample <c:if test="${registerFlag == 'create'}"><spring:message code="button.create" /></c:if>
                  <c:if test="${registerFlag == 'modify'}"><spring:message code="button.modify" /></c:if>
    </title>
    <link type="text/css" rel="stylesheet" href="<c:url value='/css/egovframework/sample.css'/>"/>
    
    <!--For Commons Validator Client Side-->
    <script type="text/javascript" src="<c:url value='/cmmn/validator.do'/>"></script>
    <validator:javascript formName="sampleVO" staticJavascript="false" xhtml="true" cdata="false"/>
    
    <script type="text/javaScript" language="javascript" defer="defer">
        
        /* 글 목록 화면 function */
        function fn_egov_selectList() {
           	document.detailForm.action = "<c:url value='/egovSampleList.do'/>";
           	document.detailForm.method = 'get';
           	document.detailForm.submit();
        }
        
        /* 글 삭제 function */
        function fn_egov_delete() {
        	if(confirm("정말 삭제하시겠습니까?")){
        		document.detailForm.action = "<c:url value='/deleteSample.do'/>";
               	document.detailForm.submit();	
        	} else {
        		return; 
        	}
        }
        
        /* 글 등록 function */
        function fn_egov_save() {
        	const frm = document.detailForm;
        	
        	if(!validateSampleVO(frm)){
                return;
            }else{
            	frm.action = "<c:url value="${registerFlag == 'create' ? '/addSample.do' : '/updateSample.do'}"/>";
                frm.submit();
            }
        }
        
        /* 글 등록 화면 function */
        function fn_egov_requery() {
        	
        	// 1. 폼(detailForm)을 변수에 담습니다.
            const frm = document.detailForm;
            // 2. 폼의 action 주소를 등록 화면 주소로 바꿉니다.
           
            // (리스트 화면에서 봤던 그 주소입니다!)
           
            // 3. 현재 글의 articleId를 parentArticleId라는 이름으로 URL 뒤에 붙여서 보냅니다.
            // 예: action = 주소 + "?parentArticleId=" + 현재ID;
            frm.parentArticleId.value = frm.articleId.value;
            frm.action = "<c:url value='/addSample.do'/>";
            frm.method = "get";
            // 4. 전송(submit) 합니다.
            frm.submit();
     
        }
        
        /* 관리자 답변 저장 */
        function fn_save_answer() {
		    var frm = document.answerForm;
		    
		    // [보완] 필수 입력값 확인을 가장 먼저 수행
		    if(!frm.content.value.trim()){
		        alert("답변 내용을 입력해주세요.");
		        frm.content.focus();
		        return;
		    }
		
		    // 1. 세션 체크 시작
		    fetch("<c:url value='/checkAuth.do'/>", {credentials: 'include'})
		    .then(response => {
		        if(response.status === 401) { 
		            
		                alert("세션이 만료되었습니다. 새 창에서 로그인페이지로 이동합니다");
		            	window.location.replace("<c:url value='/login.do'/>");
		        } else if( response.status === 403){
		        	alert("관리자만 답변을 등록할 수 있습니다");	
		        } else if( response.status === 200){
		            // 2. 인증 통과 후 최종 등록 확인
		            if(confirm("답변을 등록하시겠습니까?")){
		                frm.action = "<c:url value='/addAnswer.do'/>";
		                frm.submit();
		            }
		        } else {
		        	alert("인증 확인 중 오류가 발생했습니다");
		        }
		    })
		    .catch(error => {
		        console.error('Error:', error);
		        alert("통신 중 오류가 발생했습니다.");
		    });
		}
       
    </script>
</head>
<!-- <body style="text-align:center; margin:0 auto; display:inline; padding-top:100px;"> -->
<body>
<jsp:include page="/WEB-INF/jsp/egovframework/example/cmmn/header.jsp" />



    <div id="content_pop" style="float: none !important; height: auto !important;">
    	<form:form modelAttribute="sampleVO" id="detailForm" name="detailForm" method="post">
			<form:hidden path="parentArticleId" />
	    	<!-- 타이틀 -->
	    	<div id="title" style="float: none !important;">
	    		<ul style="float: none !important;">
	    			<li><img src="<c:url value='/images/egovframework/example/title_dot.gif'/>" alt=""/>
	                    <c:if test="${registerFlag == 'create'}"><spring:message code="button.create" /></c:if>
	                    <c:if test="${registerFlag == 'modify'}"><spring:message code="button.modify" /></c:if>
	                </li>
	    		</ul>
	    	</div>
	    	<!-- // 타이틀 -->
	    	<div id="table" style="float: none !important;">
	    	<table width="100%" border="1" cellpadding="0" cellspacing="0" style="bordercolor:#D3E2EC; bordercolordark:#FFFFFF; BORDER-TOP:#C2D0DB 2px solid; BORDER-LEFT:#ffffff 1px solid; BORDER-RIGHT:#ffffff 1px solid; BORDER-BOTTOM:#C2D0DB 1px solid; border-collapse: collapse;">
	    		<colgroup>
	    			<col width="150"/>
	    			<col width="?"/>
	    		</colgroup>
	    		<c:if test="${registerFlag == 'modify'}">
	    			<!-- // 게시물 아이디 : hidden 처리 -->
	        		<tr>
	        			<!-- 
	        			<td class="tbtd_caption"><label for="articleId"><spring:message code="title.sample.articleId" /></label></td>
	        			<td class="tbtd_content">
	        				<form:hidden path="articleId" cssClass="essentiality" maxlength="10" readonly="true" />
	        			</td>
	        			 -->
	        			<form:hidden path="articleId"/>
	        		</tr>
	    		</c:if>
	    		<tr>
	    			<!-- // 게시글 제목 -->
	    			<td class="tbtd_caption"><label for="title"><spring:message code="title.sample.title" /></label></td>
	    			<td class="tbtd_content">
	    				<form:input path="title" maxlength="30" cssClass="txt"/>
	    				&nbsp;<form:errors path="title" />
	    			</td>
	    		</tr>
	    		<tr>
	    			<!-- // 게시글 상태: 'REGISTER(신규접수), ANSWERED(답변완료), HOLD(보류), REQUERY(재문의) -->
	    			<td class="tbtd_caption"><label for="status"><spring:message code="title.sample.status" /></label></td>
	    			<td class="tbtd_content">
	    				<%-- // status 이전버전 
	    				<form:select path="status" cssClass="use">
	    					<form:option value="Y" label="Yes" />
	    					<form:option value="N" label="No" />
	    				</form:select>
	    				--%>
	    				<!-- // status 게시글 신규 등록시에는 REGISTER readonly 표시-->
	    				<c:if test="${registerFlag == 'create'}">
	    					<c:if test="${empty sampleVO.parentArticleId or sampleVO.parentArticleId == 0}">
	    						<input type="text" value="REGISTER" readonly="readonly" class="essentiality"></input>
	    						<form:hidden path="status" value="REGISTER" />
	    					</c:if>
	    					<c:if test="${sampleVO.parentArticleId > 0}">
	                                <input type="text" value="REQUERY" readonly="readonly" class="essentiality" />
	                                <form:hidden path="status" value="REQUERY" />
	                        </c:if>
	    				</c:if>
	    				<!-- // status 게시글 수정시에는 REGISTER readonly 표시-->
	    				<c:if test="${registerFlag == 'modify'}">
	    					<form:select path="status" cssClass="use" style="height: 32px !important;">
	    						<form:option value="REGISTER" label="민원 접수"></form:option>
	    						<form:option value="ANSWERED" label="답변 완료"></form:option>
	    						<form:option value="HOLD" label="처리 보류"></form:option>
	    						<form:option value="REQUERY" label="재문의"></form:option>
	    					</form:select>
	    				</c:if>	
	    			</td>
	    		</tr>
	    		<tr>
	    			<!-- // 게시글 내용 -->
	    			<td class="tbtd_caption"><label for="content"><spring:message code="title.sample.content" /></label></td>
	    			<td class="tbtd_content">
	    				<form:textarea path="content" rows="5" cols="58" />&nbsp;<form:errors path="content" />
	                </td>
	    		</tr>
	    		<tr>
	    			<!-- // 게시글 작성자 PK와 아이디 -->
	    			<td class="tbtd_caption"><label for="userId"><spring:message code="title.sample.username" /></label></td>
	    			<td class="tbtd_content">
	                    <c:if test="${registerFlag == 'create'}">
	                    	<input type="text" value="${not empty sampleVO.username ? sampleVO.username : '임시사용자'}" maxlength="10" readonly="readonly" class="essentiality" />
	        				<!--   &nbsp;<form:errors path="userId" /> -->
	                    </c:if>
	                    <c:if test="${registerFlag == 'modify'}">
	        				<form:input path="username" maxlength="10" cssClass="essentiality" readonly="readonly"/>
	        				<!-- &nbsp;<form:errors path="userId" /> -->
	                    </c:if>
	                </td>    
	    		</tr>
	    	</table>
	    	
	      </div>
      </form:form>
      <div id="sysbtn" style="float: none !important;">
    		<ul>
    			<li>
                    <span class="btn_blue_l">
                        <a href="javascript:fn_egov_selectList();"><spring:message code="button.list" /></a>
                        <img src="<c:url value='/images/egovframework/example/btn_bg_r.gif'/>" style="margin-left:6px;" alt=""/>
                    </span>
                </li>
    			<li>
                    <span class="btn_blue_l">
                        <a href="javascript:fn_egov_save();">
                            <c:if test="${registerFlag == 'create'}"><spring:message code="button.create" /></c:if>
                            <c:if test="${registerFlag == 'modify'}"><spring:message code="button.modify" /></c:if>
                        </a>
                        <img src="<c:url value='/images/egovframework/example/btn_bg_r.gif'/>" style="margin-left:6px;" alt=""/>
                    </span>
                </li>
    			<c:if test="${registerFlag == 'modify'}">
                    <li>
                        <span class="btn_blue_l">
                            <a href="javascript:fn_egov_delete();"><spring:message code="button.delete" /></a>
                            <img src="<c:url value='/images/egovframework/example/btn_bg_r.gif'/>" style="margin-left:6px;" alt=""/>
                        </span>
                    </li>
    			</c:if>
    			
    			<c:if test="${registerFlag == 'modify'}">
    				<li>
    					<span class="btn_blue_l">
                            <a href="javascript:fn_egov_requery();"><spring:message code="button.requery" /></a>
                            <img src="<c:url value='/images/egovframework/example/btn_bg_r.gif'/>" style="margin-left:6px;" alt=""/>
                        </span>
    				</li>
    			</c:if>	
    			<li>
                    <span class="btn_blue_l">
                        <a href="javascript:document.detailForm.reset();"><spring:message code="button.reset" /></a>
                        <img src="<c:url value='/images/egovframework/example/btn_bg_r.gif'/>" style="margin-left:6px;" alt=""/>
                    </span>
                </li>
            </ul>
    	</div>
      <!-- 답변영역 시작 -->
	  <c:if test="${registerFlag == 'modify'}">
		    <div id="answer_section" style="margin-top: 40px; float: none !important; clear: both !important;">
		        <div id="title" style="float: none !important; border-bottom: 2px solid #003366 !important; margin-bottom: 15px !important; padding-bottom: 8px !important;">
		            <ul style="float: none !important; list-style: none; margin: 0; padding: 0;">
		                <li style="font-size: 18px !important; font-weight: 700 !important; color: #0f172a !important;">
		                    <img src="<c:url value='/images/egovframework/example/title_dot.gif'/>" alt="" style="vertical-align: middle; margin-right: 8px;"/>
		                    관리자 답변
		                </li>
		            </ul>
		        </div>
		        
		        <%-- 과거 관리자 답변영역 시작 --%>
		        <c:forEach var="item" items="${answerList}" varStatus="status">
		            <div class="answer-card" style="float: none !important; clear: both !important;">
				        <%-- [1] 헤더 영역 --%>
				        <div class="answer-header">
				            <div class="info-group">
				                <span class="answer-count">관리자 답변 #${status.count}</span>
				                <span class="answer-date">
				                    (작성일: <fmt:formatDate value="${item.createdAt}" pattern="yyyy-MM-dd HH:mm"/>)
				                </span>
				                <span class="answer-date" style="margin-left: 10px;">| 담당자: ${item.adminName}</span>
				            </div>
				            <c:if test="${userRole == 'ADMIN'}">
					            <div class="answer-actions">
					                <a href="javascript:fn_edit_answer('${item.answerId}');" class="btn-edit-link">수정</a>
					                <a href="javascript:fn_delete_answer('${item.answerId}');" class="btn-delete-link">삭제</a>
					            </div>
				            </c:if>
				        </div>
				        
				        <%-- [2] 본문 영역 --%>
				        <div class="answer-body">
				            <%-- formId가 있으면 해당 서식이 DB에 있다는 뜻이므로 링크 표시 (formName 없어도 링크 생성) --%>
				            <c:if test="${not empty item.formId and item.formId > 0}">
				                <div class="form-badge">
				                    <svg style="width:14px; height:14px; margin-right:6px; flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
				                    </svg>
				                    <c:choose>
				                        <c:when test="${not empty nextUrl}">
				                            <a href="${nextUrl}/forms/${item.formId}" target="_blank" rel="noopener noreferrer">연관 서식: <c:if test="${not empty item.formName and fn:trim(item.formName) != ''}">${item.formName}</c:if><c:if test="${empty item.formName or fn:trim(item.formName) == ''}">이름없는서식</c:if></a>
				                        </c:when>
				                        <c:otherwise>
				                            <span>연관 서식: <c:if test="${not empty item.formName and fn:trim(item.formName) != ''}">${item.formName}</c:if><c:if test="${empty item.formName or fn:trim(item.formName) == ''}">이름없는서식</c:if></span>
				                        </c:otherwise>
				                    </c:choose>
				                </div>
				            </c:if>
				            
				            <%-- 실제 답변 텍스트 --%>
				            <div class="content-text">
				                ${item.content}
				            </div>
				        </div>
				    </div>
		        </c:forEach>
		        <%-- 과거 관리자 답변영역 끝 --%>
		        
		        <%-- 신규 관리자 등록영역 시작 --%>
		        <c:if test="${userRole == 'ADMIN'}">
			        <%-- 답변 등록용 단독 폼 --%>
					<form id="answerForm" name="answerForm" method="post">
					    <%-- 어느 게시글의 답변인지 알려주는 부모 ID --%>
					    <input type="hidden" name="articleId" value="${sampleVO.articleId}" />
				        <div id="table" style="float: none !important;">
				            <input type="hidden" name="answerId" value="${answerVO.answerId}" />
				            
				            <table width="100%" border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e2e8f0;">
				                <colgroup>
				                    <col width="150"/>
				                    <col width="?"/>
				                </colgroup>
				                
				                <tr>
				                    <td class="tbtd_caption"><label for="formId">추천 민원서식</label></td>
				                    <td class="tbtd_content">
				                        <select name="formId" style="width: 300px !important; padding: 4px; border: 1px solid #e2e8f0; border-radius: 4px; height: 32px !important">
				                            <option value="">-- 관련 서식이 있을 경우 선택해주세요 --</option>
				                            <c:forEach var="form" items="${formsList}">
				                                <option value="${form.formId}" ${answerVO.formId == form.formId ? 'selected' : ''}>
				                                    ${form.formName}
				                                </option>
				                            </c:forEach>
				                        </select>
				                        <span style="font-size: 12px; color: #64748b; margin-left: 10px;"></span>
				                    </td>
				                </tr>
				
				                <tr>
				                    <td class="tbtd_caption"><label for="answerContent">답변 내용</label></td>
				                    <td class="tbtd_content" style="padding: 15px !important;">
				                        <textarea id="answerContent" name="content" rows="12" 
				                            style="width: 100% !important; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; transition: border-color 0.2s;"
				                            >${answerVO.content}</textarea>
				                    </td>
				                </tr>
				
				                <c:if test="${not empty answerVO.adminName}">
				                    <tr>
				                        <td class="tbtd_caption">최종 작성자</td>
				                        <td class="tbtd_content">
				                            <input type="text" value="${answerVO.adminName}" readonly="readonly" style="border: none; background: transparent; color: #64748b;" />
				                            <span style="font-size: 12px; color: #94a3b8; margin-left: 10px;">(수정일: ${answerVO.updatedAt})</span>
				                        </td>
				                    </tr>
				                </c:if>
				            </table>
				            <%-- 버튼 영역 --%>
							<div id="sysbtn" style="margin-top: 20px; text-align: right; float: none !important; clear: both !important;">
							    <ul style="display: flex; justify-content: flex-end; list-style: none; gap: 10px; padding: 0;">
							        <li>
							            <span class="btn_blue_l">
							                <%-- 수정 모드일 때와 신규 등록일 때 버튼 텍스트를 분기할 수 있습니다 --%>
							                <a href="javascript:fn_save_answer();" style="background: #003366 !important; color: white !important;">
							                    <c:choose>
							                        <c:when test="${not empty answerVO.answerId}">답변 수정</c:when>
							                        <c:otherwise>답변 등록</c:otherwise>
							                    </c:choose>
							                </a>
							                <img src="<c:url value='/images/egovframework/example/btn_bg_r.gif'/>" style="margin-left:6px; display:none;" alt=""/>
							            </span>
							        </li>
							        <c:if test="${not empty answerVO.answerId}">
							            <li>
							                <span class="btn_blue_l">
							                    <a href="javascript:location.reload();" style="background: #64748b !important; color: white !important;">취소</a>
							                </span>
							            </li>
							        </c:if>
							    </ul>
							</div>
							<%-- 버튼 영역 --%>
				        </div>			        
		        	</form>
			        <%-- 신규 관리자 등록영역 끝 --%>
		        </c:if>   
		    </div>
		</c:if>
      	
   </div>
      
    <!-- 검색조건 유지 -->
    <input type="hidden" name="searchCondition" value="<c:out value='${searchVO.searchCondition}'/>"/>
    <input type="hidden" name="searchKeyword" value="<c:out value='${searchVO.searchKeyword}'/>"/>
    <input type="hidden" name="pageIndex" value="<c:out value='${searchVO.pageIndex}'/>"/>

</body>
</html>