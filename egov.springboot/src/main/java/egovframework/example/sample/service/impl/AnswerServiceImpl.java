package egovframework.example.sample.service.impl;

import java.util.List;

import javax.annotation.Resource;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.example.sample.service.AnswerService;
import egovframework.example.sample.service.AnswerVO;
import lombok.RequiredArgsConstructor;

@Service("answerService")
public class AnswerServiceImpl extends EgovAbstractServiceImpl implements AnswerService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(AnswerServiceImpl.class);
	
	@Resource(name="answerMapper")
	private AnswerMapper answerMapper;
	
	// 1. 답변 등록 및 게시글 상태 변경
    @Override
    @Transactional
    public void insertAnswer(AnswerVO vo) throws Exception {
        LOGGER.debug("insertAnswer - articleId: {}, userId: {}", vo.getArticleId(), vo.getUserId());
        answerMapper.insertAnswer(vo);
        answerMapper.updateArticleStatusToAnswered(vo.getArticleId());
    }

    // 2. 답변 목록 조회
    @Override
    public List<AnswerVO> selectAnswerList(int articleId) throws Exception {
        return answerMapper.selectAnswerList(articleId);
    }

    // 3. 답변 삭제
    @Override
    @Transactional
    public void deleteAnswer(int answerId, int articleId) throws Exception {
        LOGGER.debug("deleteAnswer - answerId: {}", answerId);
        answerMapper.deleteAnswer(answerId);
    }
}
