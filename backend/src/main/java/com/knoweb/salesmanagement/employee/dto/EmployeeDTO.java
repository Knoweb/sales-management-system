package com.knoweb.salesmanagement.employee.dto;

import com.knoweb.salesmanagement.department.dto.DepartmentDTO;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.enums.EmploymentType;
import com.knoweb.salesmanagement.user.dto.SafeUserDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class EmployeeDTO {
    private UUID id;
    private String employeeNumber;
    private SafeUserDto user;
    private DepartmentDTO department;
    private String firstName;
    private String lastName;
    private String workEmail;
    private String personalEmail;
    private String contactNumber;
    private String jobTitle;
    private EmploymentType employmentType;
    private EmploymentStatus employmentStatus;
    private LocalDate hireDate;
    private BigDecimal weeklyCapacityHours;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Calculated field
    private boolean isDepartmentHead;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public SafeUserDto getUser() {
        return user;
    }

    public void setUser(SafeUserDto user) {
        this.user = user;
    }

    public DepartmentDTO getDepartment() {
        return department;
    }

    public void setDepartment(DepartmentDTO department) {
        this.department = department;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getWorkEmail() {
        return workEmail;
    }

    public void setWorkEmail(String workEmail) {
        this.workEmail = workEmail;
    }

    public String getPersonalEmail() {
        return personalEmail;
    }

    public void setPersonalEmail(String personalEmail) {
        this.personalEmail = personalEmail;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public EmploymentStatus getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(EmploymentStatus employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public BigDecimal getWeeklyCapacityHours() {
        return weeklyCapacityHours;
    }

    public void setWeeklyCapacityHours(BigDecimal weeklyCapacityHours) {
        this.weeklyCapacityHours = weeklyCapacityHours;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isDepartmentHead() {
        return isDepartmentHead;
    }

    public void setDepartmentHead(boolean departmentHead) {
        isDepartmentHead = departmentHead;
    }
}
