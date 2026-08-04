package com.knoweb.salesmanagement.technicalproject.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Request/Response DTO for employee availability search.
 * GET /api/v1/employees/availability
 */
public class EmployeeAvailabilityDTO {

    private UUID employeeId;
    private String employeeNumber;
    private String employeeName;
    private String jobTitle;
    private UUID departmentId;
    private String departmentName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal weeklyCapacityHours;
    private BigDecimal estimatedCapacityHours;
    private BigDecimal approvedLeaveHours;
    private BigDecimal activeAllocationHours;
    private BigDecimal estimatedAvailableHours;
    private BigDecimal availabilityPercentage;
    private String availabilityStatus; // AVAILABLE, PARTIALLY_AVAILABLE, UNAVAILABLE
    private List<String> skills;
    private Boolean available;
    private List<String> conflicts;

    public EmployeeAvailabilityDTO() {}

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getWeeklyCapacityHours() { return weeklyCapacityHours; }
    public void setWeeklyCapacityHours(BigDecimal weeklyCapacityHours) { this.weeklyCapacityHours = weeklyCapacityHours; }

    public BigDecimal getEstimatedCapacityHours() { return estimatedCapacityHours; }
    public void setEstimatedCapacityHours(BigDecimal estimatedCapacityHours) { this.estimatedCapacityHours = estimatedCapacityHours; }

    public BigDecimal getApprovedLeaveHours() { return approvedLeaveHours; }
    public void setApprovedLeaveHours(BigDecimal approvedLeaveHours) { this.approvedLeaveHours = approvedLeaveHours; }

    public BigDecimal getActiveAllocationHours() { return activeAllocationHours; }
    public void setActiveAllocationHours(BigDecimal activeAllocationHours) { this.activeAllocationHours = activeAllocationHours; }

    public BigDecimal getEstimatedAvailableHours() { return estimatedAvailableHours; }
    public void setEstimatedAvailableHours(BigDecimal estimatedAvailableHours) { this.estimatedAvailableHours = estimatedAvailableHours; }

    public BigDecimal getAvailabilityPercentage() { return availabilityPercentage; }
    public void setAvailabilityPercentage(BigDecimal availabilityPercentage) { this.availabilityPercentage = availabilityPercentage; }

    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public List<String> getSkills() {
        return skills != null ? skills : java.util.Collections.emptyList();
    }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public Boolean getAvailable() {
        return available != null ? available : true;
    }
    public void setAvailable(Boolean available) { this.available = available; }

    public List<String> getConflicts() {
        return conflicts != null ? conflicts : java.util.Collections.emptyList();
    }
    public void setConflicts(List<String> conflicts) { this.conflicts = conflicts; }
}

