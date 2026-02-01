<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c"      uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form"   uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="ui"     uri="http://egovframework.gov/ctl/ui"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%
  /**
  * @Class Name : egovSampleList.jsp
  * @Description : Sample List 화면
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
    <title><spring:message code="title.sample" /></title>
    <link type="text/css" rel="stylesheet" href="<c:url value='/css/egovframework/sample.css'/>"/>
    <script type="text/javaScript" language="javascript" defer="defer">
        
        /* 글 수정 화면 function */
        function fn_egov_select(articleId) {
        	document.listForm.articleId.value = articleId;
           	document.listForm.action = "<c:url value='/updateSampleView.do'/>";
           	document.listForm.submit();
        }
       
        /* 글 등록 화면 function */
        function fn_egov_addView() {
           	document.listForm.action = "<c:url value='/addSample.do'/>";
           	document.listForm.submit();
        }
        <!--
        /* 글 목록 화면 function */
        function fn_egov_selectList() {
        	document.listForm.action = "<c:url value='/egovSampleList.do'/>";
           	document.listForm.submit();
        }
        
        /* pagination 페이지 링크 function */
        function fn_egov_link_page(pageNo){
        	document.listForm.pageIndex.value = pageNo;
        	document.listForm.action = "<c:url value='/egovSampleList.do'/>";
           	document.listForm.submit();
        }
        
        //-->
    </script>
</head>

<!--<body style="text-align:center; margin:0 auto; display:inline; padding-top:100px;">  -->
<body>
	<jsp:include page="/WEB-INF/jsp/egovframework/example/cmmn/header.jsp" />
    <form:form modelAttribute="searchVO" id="listForm" name="listForm" method="get">
        <input type="hidden" name="articleId" />
        <div id="content_pop" style="float: none !important; height: auto !important;">
        	<!-- 타이틀 -->
        	<div id="title">
        		<ul>
        			<li><img src="<c:url value='/images/egovframework/example/title_dot.gif'/>" alt=""/><spring:message code="list.sample" /></li>
        		</ul>
        	</div>
        	<!-- // 타이틀 -->
        	<div id="search">
        		<ul>
        			<li>
        			    <label for="searchCondition" style="visibility:hidden;"><spring:message code="search.choose" /></label>
        				<form:select path="searchCondition" cssClass="use">
        					<form:option value="0"><spring:message code="title.sample.title"/></form:option>
        					<form:option value="1"><spring:message code="title.sample.content"/></form:option>
        					<form:option value="2"><spring:message code="title.sample.username"/></form:option>
        				</form:select>
        			</li>
        			<li><label for="searchKeyword" style="visibility:hidden;display:none;"><spring:message code="search.keyword" /></label>
                        <form:input path="searchKeyword" cssClass="txt"/>
                    </li>
        			<li>
        	            <span class="btn_blue_l">
        	                <a href="javascript:fn_egov_selectList();"><spring:message code="button.search" /></a>
        	                <!-- <img src="<c:url value='/images/egovframework/example/btn_bg_r.gif'/>" style="margin-left:6px;" alt=""/> -->
        	                <img src="" style="margin-left:6px;" alt=""/>
        	            </span>
        	        </li>
                </ul>
        	</div>
        	<!-- List -->
        	<div id="table">
        		<!-- <table width="100%" border="0" cellpadding="0" cellspacing="0" summary="번호, 게시글ID, 제목, 상태, 내용 요약, 작성자를 표시하는 테이블입니다."> -->
        		<table>
        			<caption style="visibility:hidden">번호, 게시글ID, 제목, 상태, 내용 요약, 작성자를 표시하는 테이블입니다.</caption>
        			<colgroup>
        				<col style="width:80px;"/>
        				<col style="width:auto;"/>
        				<col style="width:120px;"/>
        				<col style="width:auto;"/>
        				<col style="width:120px;"/>
        			</colgroup>
        			<tr>
        				<th>No</th>
        				<th><spring:message code="title.sample.title" /></th>
        				<th><spring:message code="title.sample.status" /></th>
        				<th><spring:message code="title.sample.content" /></th>
        				<th><spring:message code="title.sample.username" /></th>
        			</tr>
        			<c:forEach var="result" items="${resultList}" varStatus="status">
            			<tr>
            				<%-- 역순 번호: totalRecordCount - (pageIndex-1)*recordCountPerPage - status.index. 0 이하일 때는 현재 페이지 내 순번 표시 --%>
            				<c:set var="rowNo" value="${paginationInfo.totalRecordCount - (searchVO.pageIndex - 1) * paginationInfo.recordCountPerPage - status.index}"/>
            				<td class="listtd"><c:out value="${rowNo >= 1 ? rowNo : (searchVO.pageIndex - 1) * paginationInfo.recordCountPerPage + status.count}"/></td>
            				<td class="listtd">
            					<c:if test="${result.parentArticleId > 0}">
                					&nbsp;&nbsp; 
            					</c:if>
            					<a href="javascript:fn_egov_select('<c:out value="${result.articleId}"/>')"><c:out value="${result.title}"/></a>
            					<c:if test="${not empty result.parentTitle}">
							        <br/>
							        <small style="color:#999; margin-left:25px;">
							            └ 원문: <c:out value="${result.parentTitle}"/>
							        </small>
							    </c:if>
            				</td>
           					<!--<c:out value="${result.status}"/>&nbsp;-->
            				<td class="listtd">
            					<c:choose>
            						<c:when test="${result.status == 'REGISTER'}">민원 접수</c:when>
                					<c:when test="${result.status == 'REQUERY'}">재문의</c:when>
                					<c:otherwise><c:out value="${result.status}"/></c:otherwise>
            					</c:choose>
            				</td>
            				<td class="listtd"><c:out value="${result.content}"/>&nbsp;</td>
            				<td class="listtd"><c:out value="${result.username}"/>&nbsp;</td>
            			</tr>
        			</c:forEach>
        		</table>
        	</div>
        	<!-- /List -->
        	<div id="paging">
        		<ui:pagination paginationInfo = "${paginationInfo}" type="image" jsFunction="fn_egov_link_page" />
        		<form:hidden path="pageIndex" />
        	</div>
        	<div id="sysbtn">
        	  <ul>
        	      <li>
        	          <span class="btn_blue_l">
        	              <a href="javascript:fn_egov_addView();"><spring:message code="button.create" /></a>
        	              <!-- <img src="<c:url value='/images/egovframework/example/btn_bg_r.gif'/>" style="margin-left:6px;" alt=""/> -->
                          <img src="" style="margin-left:6px;" alt=""/>
                      </span>
                  </li>
              </ul>
        	</div>
        </div>
    </form:form>
</body>
</html>
