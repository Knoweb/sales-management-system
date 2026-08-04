package com.knoweb.salesmanagement.technicalproject.dto;

import com.knoweb.salesmanagement.technicalproject.enums.TeamFormationStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class TechnicalProjectDepartmentDTO {
    private UUID id;
    private UUID departmentId;
    private String departmentName;
    private String departmentCode;
    private String requiredScope;
    private LocalDate expectedEstimateSubmissionDate;
    private String routingNotes;
    private TeamFormationStatus formationStatus;
    private UUID assignedBy;
    private String assignedByName;
    private OffsetDateTime assignedAt;

    public TechnicalProjectDepartmentDTO() {}

    public TechnicalProjectDepartmentDTO(UUID id, UUID departmentId, String departmentName, String departmentCode, String requiredScope, LocalDate expectedEstimateSubmissionDate, String routingNotes, TeamFormationStatus formationStatus, UUID assignedBy, String assignedByName, OffsetDateTime assignedAt) {
        this.id = id;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.requiredScope = requiredScope;
        this.expectedEstimateSubmissionDate = expectedEstimateSubmissionDate;
        this.routingNotes = routingNotes;
        this.formationStatus = formationStatus;
        this.assignedBy = assignedBy;
        this.assignedByName = assignedByName;
        this.assignedAt = assignedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(UUID departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
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

    public TeamFormationStatus getFormationStatus() {
        return formationStatus;
    }

    public void setFormationStatus(TeamFormationStatus formationStatus) {
        this.formationStatus = formationStatus;
    }

    public UUID getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(UUID assignedBy) {
        this.assignedBy = assignedBy;
    }

    public String getAssignedByName() {
        return assignedByName;
    }

    public void setAssignedByName(String assignedByName) {
        this.assignedByName = assignedByName;
    }

    public OffsetDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(OffsetDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
