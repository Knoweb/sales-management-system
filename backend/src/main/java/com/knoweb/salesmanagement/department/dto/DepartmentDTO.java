package com.knoweb.salesmanagement.department.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class DepartmentDTO {
    private UUID id;
    private String code;
    private String name;
    private String description;
    private boolean active;
    private boolean systemSeeded;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Aggregated stats (calculated in service)
    private EmployeeSummaryDTO activeHod;
    private long employeeCount;
    private long activeEmployeeCount;

    // getters and setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isSystemSeeded() {
        return systemSeeded;
    }

    public void setSystemSeeded(boolean systemSeeded) {
        this.systemSeeded = systemSeeded;
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

    public EmployeeSummaryDTO getActiveHod() {
        return activeHod;
    }

    public void setActiveHod(EmployeeSummaryDTO activeHod) {
        this.activeHod = activeHod;
    }

    public long getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(long employeeCount) {
        this.employeeCount = employeeCount;
    }

    public long getActiveEmployeeCount() {
        return activeEmployeeCount;
    }

    public void setActiveEmployeeCount(long activeEmployeeCount) {
        this.activeEmployeeCount = activeEmployeeCount;
    }
}
