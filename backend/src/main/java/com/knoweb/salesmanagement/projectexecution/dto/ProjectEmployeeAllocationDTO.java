package com.knoweb.salesmanagement.projectexecution.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ProjectEmployeeAllocationDTO {
    private UUID id;
    @NotNull
    private UUID workspaceId;
    @NotNull
    private UUID employeeId;
    private String employeeName;
    @NotNull
    private UUID departmentId;
    private String departmentName;
    private String roleDescription;
    private BigDecimal allocationPercentage;
    private BigDecimal allocatedHours;
    private LocalDate allocationStartDate;
    private LocalDate allocationEndDate;
    private Boolean isActive;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }
    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getRoleDescription() { return roleDescription; }
    public void setRoleDescription(String roleDescription) { this.roleDescription = roleDescription; }
    public BigDecimal getAllocationPercentage() { return allocationPercentage; }
    public void setAllocationPercentage(BigDecimal allocationPercentage) { this.allocationPercentage = allocationPercentage; }
    public BigDecimal getAllocatedHours() { return allocatedHours; }
    public void setAllocatedHours(BigDecimal allocatedHours) { this.allocatedHours = allocatedHours; }
    public LocalDate getAllocationStartDate() { return allocationStartDate; }
    public void setAllocationStartDate(LocalDate allocationStartDate) { this.allocationStartDate = allocationStartDate; }
    public LocalDate getAllocationEndDate() { return allocationEndDate; }
    public void setAllocationEndDate(LocalDate allocationEndDate) { this.allocationEndDate = allocationEndDate; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

}
