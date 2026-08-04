package com.knoweb.salesmanagement.technicalproject.dto;

import com.knoweb.salesmanagement.technicalproject.enums.ProjectRole;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Request body for adding a member to a project team.
 */
public class AddTeamMemberRequest {

    @NotNull(message = "employeeId is required")
    private UUID employeeId;

    @NotNull(message = "projectRole is required")
    private ProjectRole projectRole;

    @NotNull(message = "allocationStartDate is required")
    private LocalDate allocationStartDate;

    @NotNull(message = "allocationEndDate is required")
    private LocalDate allocationEndDate;

    @NotNull(message = "assignedHours is required")
    @DecimalMin(value = "0.01", message = "assignedHours must be positive")
    private BigDecimal assignedHours;

    private boolean primaryMember = false;

    // Override fields
    private boolean overrideRequested = false;
    private String overrideReason;

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public ProjectRole getProjectRole() { return projectRole; }
    public void setProjectRole(ProjectRole projectRole) { this.projectRole = projectRole; }

    public LocalDate getAllocationStartDate() { return allocationStartDate; }
    public void setAllocationStartDate(LocalDate allocationStartDate) { this.allocationStartDate = allocationStartDate; }

    public LocalDate getAllocationEndDate() { return allocationEndDate; }
    public void setAllocationEndDate(LocalDate allocationEndDate) { this.allocationEndDate = allocationEndDate; }

    public BigDecimal getAssignedHours() { return assignedHours; }
    public void setAssignedHours(BigDecimal assignedHours) { this.assignedHours = assignedHours; }

    public boolean isPrimaryMember() { return primaryMember; }
    public void setPrimaryMember(boolean primaryMember) { this.primaryMember = primaryMember; }

    public boolean isOverrideRequested() { return overrideRequested; }
    public void setOverrideRequested(boolean overrideRequested) { this.overrideRequested = overrideRequested; }

    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }
}
