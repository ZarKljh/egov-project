package egovframework.example.sample.service;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AnswerVO implements Serializable {
	private static final long serialVersionUID = 1L;

    private int answerId;      // answer_id (PK)
    private int articleId;     // article_id (FK)
    private int userId;        // 작성자(Admin) ID
    private Integer formId;    // 추천 민원서식 ID (Null 가능)
    private String content;    // 답변 내용
    
    // DB 연동 시 Join 데이터를 담기 위한 추가 필드
    private String adminName;  // 관리자 성명
    private String formName;   // 서식명
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
