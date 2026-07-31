package com.knoweb.salesmanagement.projectbrief.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectBriefAttachmentDTO {
    private UUID id;
    private UUID projectBriefId;
    private String fileName;
    private String fileType;
    private String fileUrl;
    private Long fileSize;
    private UUID createdById;
    private String createdByName;
    private OffsetDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProjectBriefId() { return projectBriefId; }
    public void setProjectBriefId(UUID projectBriefId) { this.projectBriefId = projectBriefId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public UUID getCreatedById() { return createdById; }
    public void setCreatedById(UUID createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
