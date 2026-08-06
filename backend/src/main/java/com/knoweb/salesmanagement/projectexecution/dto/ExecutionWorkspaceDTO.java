package com.knoweb.salesmanagement.projectexecution.dto;

import com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ExecutionWorkspaceDTO {
    private UUID id;
    private UUID technicalProjectId;
    private String projectCode;
    private UUID projectManagerId;
    private String projectManagerName;
    private ExecutionWorkspaceStatus status;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private BigDecimal overallProgress;
    private String executionNotes;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTechnicalProjectId() { return technicalProjectId; }
    public void setTechnicalProjectId(UUID technicalProjectId) { this.technicalProjectId = technicalProjectId; }
    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
    public UUID getProjectManagerId() { return projectManagerId; }
    public void setProjectManagerId(UUID projectManagerId) { this.projectManagerId = projectManagerId; }
    public String getProjectManagerName() { return projectManagerName; }
    public void setProjectManagerName(String projectManagerName) { this.projectManagerName = projectManagerName; }
    public ExecutionWorkspaceStatus getStatus() { return status; }
    public void setStatus(ExecutionWorkspaceStatus status) { this.status = status; }
    public LocalDate getPlannedStartDate() { return plannedStartDate; }
    public void setPlannedStartDate(LocalDate plannedStartDate) { this.plannedStartDate = plannedStartDate; }
    public LocalDate getPlannedEndDate() { return plannedEndDate; }
    public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; }
    public LocalDate getActualStartDate() { return actualStartDate; }
    public void setActualStartDate(LocalDate actualStartDate) { this.actualStartDate = actualStartDate; }
    public LocalDate getActualEndDate() { return actualEndDate; }
    public void setActualEndDate(LocalDate actualEndDate) { this.actualEndDate = actualEndDate; }
    public BigDecimal getOverallProgress() { return overallProgress; }
    public void setOverallProgress(BigDecimal overallProgress) { this.overallProgress = overallProgress; }
    public String getExecutionNotes() { return executionNotes; }
    public void setExecutionNotes(String executionNotes) { this.executionNotes = executionNotes; }

}
