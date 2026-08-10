package com.knoweb.salesmanagement.projectexecution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class DailyProgressUpdateDTO {
    private UUID id;
    @NotNull
    private UUID workspaceId;
    private UUID taskId;
    private String taskTitle;
    @NotNull
    private UUID employeeId;
    private String employeeName;
    @NotNull
    private LocalDate progressDate;
    @NotBlank
    private String workCompleted;
    private String workPlannedNext;
    private String blockers;
    private BigDecimal completionPercentage;
    private BigDecimal hoursWorked;
    private OffsetDateTime submittedAt;
    private Boolean supportRequired;
    private String supportDetails;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }
    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }
    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    public LocalDate getProgressDate() { return progressDate; }
    public void setProgressDate(LocalDate progressDate) { this.progressDate = progressDate; }
    public String getWorkCompleted() { return workCompleted; }
    public void setWorkCompleted(String workCompleted) { this.workCompleted = workCompleted; }
    public String getWorkPlannedNext() { return workPlannedNext; }
    public void setWorkPlannedNext(String workPlannedNext) { this.workPlannedNext = workPlannedNext; }
    public String getBlockers() { return blockers; }
    public void setBlockers(String blockers) { this.blockers = blockers; }
    public BigDecimal getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(BigDecimal completionPercentage) { this.completionPercentage = completionPercentage; }
    public BigDecimal getHoursWorked() { return hoursWorked; }
    public void setHoursWorked(BigDecimal hoursWorked) { this.hoursWorked = hoursWorked; }
    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Boolean getSupportRequired() { return supportRequired; }
    public void setSupportRequired(Boolean supportRequired) { this.supportRequired = supportRequired; }
    public String getSupportDetails() { return supportDetails; }
    public void setSupportDetails(String supportDetails) { this.supportDetails = supportDetails; }

}
