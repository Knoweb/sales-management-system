package com.knoweb.salesmanagement.projectbrief.dto;

import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectBriefSummaryDTO {
    private UUID id;
    private ProjectBriefStatus status;
    private OffsetDateTime dueAt;
    private boolean overdue;
    private Long overdueHours;
    private String deadlineStatus; // ON_TIME, DUE_SOON, OVERDUE, SUBMITTED_ON_TIME, SUBMITTED_LATE
    private Integer currentVersionNumber;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProjectBriefStatus getStatus() { return status; }
    public void setStatus(ProjectBriefStatus status) { this.status = status; }
    public OffsetDateTime getDueAt() { return dueAt; }
    public void setDueAt(OffsetDateTime dueAt) { this.dueAt = dueAt; }
    public boolean isOverdue() { return overdue; }
    public void setOverdue(boolean overdue) { this.overdue = overdue; }
    public Long getOverdueHours() { return overdueHours; }
    public void setOverdueHours(Long overdueHours) { this.overdueHours = overdueHours; }
    public String getDeadlineStatus() { return deadlineStatus; }
    public void setDeadlineStatus(String deadlineStatus) { this.deadlineStatus = deadlineStatus; }
    public Integer getCurrentVersionNumber() { return currentVersionNumber; }
    public void setCurrentVersionNumber(Integer currentVersionNumber) { this.currentVersionNumber = currentVersionNumber; }
}
