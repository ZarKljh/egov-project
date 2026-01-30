package egovframework.example.sample.service.impl;

import java.util.List;

import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import egovframework.example.sample.service.AnswerVO;

@Mapper
public interface AnswerMapper {
    // 1. 답변 등록
    int insertAnswer(AnswerVO vo) throws Exception;

    // 2. 게시글 상태 변경 (민원 완료 처리)
    int updateArticleStatusToAnswered(int articleId) throws Exception;

    // 3. 특정 게시글의 답변 조회
    List<AnswerVO> selectAnswerList(int articleId) throws Exception;
    
    // 4. 특정 게시글의 답변 삭제
    int deleteAnswer(int answerId) throws Exception;
    
}