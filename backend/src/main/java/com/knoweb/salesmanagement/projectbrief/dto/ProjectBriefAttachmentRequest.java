package com.knoweb.salesmanagement.projectbrief.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.URL;

public class ProjectBriefAttachmentRequest {
    @NotBlank(message = "File name is required")
    private String fileName;
    
    private String fileType;
    
    @NotBlank(message = "File URL is required")
    private String fileUrl;
    
    private Long fileSize;

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
}
