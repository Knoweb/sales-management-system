package com.knoweb.salesmanagement.technicalproject.dto;

import com.knoweb.salesmanagement.technicalproject.enums.ProjectRole;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectTeamMemberStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectTeamMemberDTO {

    private UUID id;
    private UUID employeeId;
    private String employeeNumber;
    private String employeeName;
    private String jobTitle;
    private ProjectRole projectRole;
    private LocalDate allocationStartDate;
    private LocalDate allocationEndDate;
    private BigDecimal assignedHours;
    private boolean primaryMember;
    private ProjectTeamMemberStatus status;
    private UUID allocationId;
    private boolean overrideFlag;
    private String overrideReason;
    private OffsetDateTime addedAt;

    public ProjectTeamMemberDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

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

    public ProjectTeamMemberStatus getStatus() { return status; }
    public void setStatus(ProjectTeamMemberStatus status) { this.status = status; }

    public UUID getAllocationId() { return allocationId; }
    public void setAllocationId(UUID allocationId) { this.allocationId = allocationId; }

    public boolean isOverrideFlag() { return overrideFlag; }
    public void setOverrideFlag(boolean overrideFlag) { this.overrideFlag = overrideFlag; }

    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }

    public OffsetDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(OffsetDateTime addedAt) { this.addedAt = addedAt; }
}
