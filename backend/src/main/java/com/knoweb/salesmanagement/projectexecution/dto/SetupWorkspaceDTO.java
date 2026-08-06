package com.knoweb.salesmanagement.projectexecution.dto;

import com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class SetupWorkspaceDTO {

    @NotNull(message = "Project Manager is required")
    private UUID projectManagerId;

    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;

    @NotNull(message = "Status is required")
    private ExecutionWorkspaceStatus status;

    private String executionNotes;

    // Getters and Setters
    public UUID getProjectManagerId() {
        return projectManagerId;
    }

    public void setProjectManagerId(UUID projectManagerId) {
        this.projectManagerId = projectManagerId;
    }

    public LocalDate getPlannedStartDate() {
        return plannedStartDate;
    }

    public void setPlannedStartDate(LocalDate plannedStartDate) {
        this.plannedStartDate = plannedStartDate;
    }

    public LocalDate getPlannedEndDate() {
        return plannedEndDate;
    }

    public void setPlannedEndDate(LocalDate plannedEndDate) {
        this.plannedEndDate = plannedEndDate;
    }

    public ExecutionWorkspaceStatus getStatus() {
        return status;
    }

    public void setStatus(ExecutionWorkspaceStatus status) {
        this.status = status;
    }

    public String getExecutionNotes() {
        return executionNotes;
    }

    public void setExecutionNotes(String executionNotes) {
        this.executionNotes = executionNotes;
    }

}
