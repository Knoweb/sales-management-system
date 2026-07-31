package com.knoweb.salesmanagement.projectbrief.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectBriefVersionDTO {
    private UUID id;
    private UUID projectBriefId;
    private Integer versionNumber;
    private String snapshot;
    private String changeSummary;
    private boolean submittedVersion;
    private UUID createdById;
    private String createdByName;
    private OffsetDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProjectBriefId() { return projectBriefId; }
    public void setProjectBriefId(UUID projectBriefId) { this.projectBriefId = projectBriefId; }
    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
    public String getSnapshot() { return snapshot; }
    public void setSnapshot(String snapshot) { this.snapshot = snapshot; }
    public String getChangeSummary() { return changeSummary; }
    public void setChangeSummary(String changeSummary) { this.changeSummary = changeSummary; }
    public boolean isSubmittedVersion() { return submittedVersion; }
    public void setSubmittedVersion(boolean submittedVersion) { this.submittedVersion = submittedVersion; }
    public UUID getCreatedById() { return createdById; }
    public void setCreatedById(UUID createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
