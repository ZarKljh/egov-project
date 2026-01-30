package egovframework.example.sample.service;

import java.io.Serializable;
import java.time.LocalDateTime;

public class FormsVO implements Serializable{
	
	private static final long serialVersionUID = 1L;
	
	/** 서식 고유 아이디 */
	private Long formId;
	
	/** 서식명  */
	private String formName;
	
	/** 서식 상세설명 */
	private String description;
	
	/** 서식 다운로드 가능 여부 */
	private boolean downloadable;
	
	/** 서식 생성일 */
	private LocalDateTime createdAt;
	
	/** Getter 와 Setter */
	public Long getFormId() {
		return this.formId;
	}
	public void setFormId(Long formId) {
		this.formId = formId;
	}
	public String getFormName() {
		return this.formName;
	}
	public void setFormName(String formName) {
		this.formName = formName;
	}
	public String getDescription() {
		return this.description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public boolean isDownloadable() {
		return this.downloadable;
	}
	public void setDownloadable(boolean downloadable) {
		this.downloadable = downloadable;
	}
	public LocalDateTime getCreatedAt() {
		return this.createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
