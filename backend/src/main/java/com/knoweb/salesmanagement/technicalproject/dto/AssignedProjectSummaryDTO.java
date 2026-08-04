package com.knoweb.salesmanagement.technicalproject.dto;

import com.knoweb.salesmanagement.technicalproject.enums.TeamFormationStatus;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Summary DTO for the HOD assigned-project queue:
 * GET /api/v1/departments/{deptId}/assigned-projects
 */
public class AssignedProjectSummaryDTO {

    private UUID technicalProjectDepartmentId;
    private UUID technicalProjectId;
    private String projectCode;
    private TechnicalProjectStatus projectStatus;
    private String projectTitle;
    private String clientName;
    private String requiredScope;
    private LocalDate expectedEstimateSubmissionDate;
    private TeamFormationStatus formationStatus;
    private UUID projectTeamId;
    private OffsetDateTime assignedAt;

    public AssignedProjectSummaryDTO() {}

    public AssignedProjectSummaryDTO(UUID technicalProjectDepartmentId, UUID technicalProjectId, String projectCode,
                                      TechnicalProjectStatus projectStatus, String projectTitle, String clientName,
                                      String requiredScope, LocalDate expectedEstimateSubmissionDate,
                                      TeamFormationStatus formationStatus, UUID projectTeamId, OffsetDateTime assignedAt) {
        this.technicalProjectDepartmentId = technicalProjectDepartmentId;
        this.technicalProjectId = technicalProjectId;
        this.projectCode = projectCode;
        this.projectStatus = projectStatus;
        this.projectTitle = projectTitle;
        this.clientName = clientName;
        this.requiredScope = requiredScope;
        this.expectedEstimateSubmissionDate = expectedEstimateSubmissionDate;
        this.formationStatus = formationStatus;
        this.projectTeamId = projectTeamId;
        this.assignedAt = assignedAt;
    }

    public UUID getTechnicalProjectDepartmentId() { return technicalProjectDepartmentId; }
    public void setTechnicalProjectDepartmentId(UUID technicalProjectDepartmentId) { this.technicalProjectDepartmentId = technicalProjectDepartmentId; }

    public UUID getTechnicalProjectId() { return technicalProjectId; }
    public void setTechnicalProjectId(UUID technicalProjectId) { this.technicalProjectId = technicalProjectId; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public TechnicalProjectStatus getProjectStatus() { return projectStatus; }
    public void setProjectStatus(TechnicalProjectStatus projectStatus) { this.projectStatus = projectStatus; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getRequiredScope() { return requiredScope; }
    public void setRequiredScope(String requiredScope) { this.requiredScope = requiredScope; }

    public LocalDate getExpectedEstimateSubmissionDate() { return expectedEstimateSubmissionDate; }
    public void setExpectedEstimateSubmissionDate(LocalDate expectedEstimateSubmissionDate) { this.expectedEstimateSubmissionDate = expectedEstimateSubmissionDate; }

    public TeamFormationStatus getFormationStatus() { return formationStatus; }
    public void setFormationStatus(TeamFormationStatus formationStatus) { this.formationStatus = formationStatus; }

    public UUID getProjectTeamId() { return projectTeamId; }
    public void setProjectTeamId(UUID projectTeamId) { this.projectTeamId = projectTeamId; }

    public OffsetDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(OffsetDateTime assignedAt) { this.assignedAt = assignedAt; }
}
