package com.knoweb.salesmanagement.availability.dto;

import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class AvailabilityResponseDTO {
    private UUID employeeId;
    private String employeeNumber;
    private String employeeName;
    private String department;
    private EmploymentStatus employmentStatus;
    private BigDecimal weeklyCapacityHours;
    private LocalDate requestedStartDate;
    private LocalDate requestedEndDate;
    private BigDecimal estimatedCapacityHours;
    private BigDecimal approvedLeaveHours;
    private BigDecimal estimatedAvailableHours;
    private BigDecimal availabilityPercentage;
    private String availabilityStatus;

    public UUID getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(UUID employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public EmploymentStatus getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(EmploymentStatus employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public BigDecimal getWeeklyCapacityHours() {
        return weeklyCapacityHours;
    }

    public void setWeeklyCapacityHours(BigDecimal weeklyCapacityHours) {
        this.weeklyCapacityHours = weeklyCapacityHours;
    }

    public LocalDate getRequestedStartDate() {
        return requestedStartDate;
    }

    public void setRequestedStartDate(LocalDate requestedStartDate) {
        this.requestedStartDate = requestedStartDate;
    }

    public LocalDate getRequestedEndDate() {
        return requestedEndDate;
    }

    public void setRequestedEndDate(LocalDate requestedEndDate) {
        this.requestedEndDate = requestedEndDate;
    }

    public BigDecimal getEstimatedCapacityHours() {
        return estimatedCapacityHours;
    }

    public void setEstimatedCapacityHours(BigDecimal estimatedCapacityHours) {
        this.estimatedCapacityHours = estimatedCapacityHours;
    }

    public BigDecimal getApprovedLeaveHours() {
        return approvedLeaveHours;
    }

    public void setApprovedLeaveHours(BigDecimal approvedLeaveHours) {
        this.approvedLeaveHours = approvedLeaveHours;
    }

    public BigDecimal getEstimatedAvailableHours() {
        return estimatedAvailableHours;
    }

    public void setEstimatedAvailableHours(BigDecimal estimatedAvailableHours) {
        this.estimatedAvailableHours = estimatedAvailableHours;
    }

    public BigDecimal getAvailabilityPercentage() {
        return availabilityPercentage;
    }

    public void setAvailabilityPercentage(BigDecimal availabilityPercentage) {
        this.availabilityPercentage = availabilityPercentage;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }
}
