package com.knoweb.salesmanagement.technicalproject.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class TechnicalRoutingRequest {

    @NotEmpty(message = "At least one department must be routed")
    @Valid
    private List<TechnicalRoutingDepartmentRequest> departments;

    public List<TechnicalRoutingDepartmentRequest> getDepartments() {
        return departments;
    }

    public void setDepartments(List<TechnicalRoutingDepartmentRequest> departments) {
        this.departments = departments;
    }
}
