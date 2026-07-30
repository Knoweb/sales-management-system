package com.knoweb.salesmanagement.department.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AssignDepartmentHeadRequest {

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    public UUID getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(UUID employeeId) {
        this.employeeId = employeeId;
    }
}
