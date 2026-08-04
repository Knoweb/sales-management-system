package com.knoweb.salesmanagement.technicalproject.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class TechnicalRoutingDepartmentRequest {

    @NotNull(message = "Department ID is required")
    private UUID departmentId;

    @NotBlank(message = "Required scope is mandatory")
    private String requiredScope;

    @NotNull(message = "Expected estimate submission date is required")
    @FutureOrPresent(message = "Expected estimate submission date must be today or in the future")
    private LocalDate expectedEstimateSubmissionDate;

    private String routingNotes;

    public UUID getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(UUID departmentId) {
        this.departmentId = departmentId;
    }

    public String getRequiredScope() {
        return requiredScope;
    }

    public void setRequiredScope(String requiredScope) {
        this.requiredScope = requiredScope;
    }

    public LocalDate getExpectedEstimateSubmissionDate() {
        return expectedEstimateSubmissionDate;
    }

    public void setExpectedEstimateSubmissionDate(LocalDate expectedEstimateSubmissionDate) {
        this.expectedEstimateSubmissionDate = expectedEstimateSubmissionDate;
    }

    public String getRoutingNotes() {
        return routingNotes;
    }

    public void setRoutingNotes(String routingNotes) {
        this.routingNotes = routingNotes;
    }
}
