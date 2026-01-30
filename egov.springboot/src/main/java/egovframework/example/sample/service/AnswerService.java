package egovframework.example.sample.service;

import java.util.List;

public interface AnswerService {
	// 답변 등록 (게시글 상태 변경 포함)
    void insertAnswer(AnswerVO vo) throws Exception;

    // 답변 목록 조회
    List<AnswerVO> selectAnswerList(int articleId) throws Exception;

    // 답변 삭제 (게시글 상태 복원 로직 포함 가능)
    void deleteAnswer(int answerId, int articleId) throws Exception;
}
