package com.knoweb.salesmanagement.technicalproject.dto;

import com.knoweb.salesmanagement.technicalproject.enums.ProjectTeamStatus;
import com.knoweb.salesmanagement.technicalproject.enums.TeamFormationStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class ProjectTeamDetailDTO {

    private UUID id;
    private UUID technicalProjectDepartmentId;
    private UUID technicalProjectId;
    private UUID departmentId;
    private String projectCode;
    private String projectTitle;
    private String clientName;
    private String departmentName;
    private String teamName;
    private ProjectTeamStatus status;
    private TeamFormationStatus formationStatus;
    private String requiredScope;
    private LocalDate expectedStartDate;
    private LocalDate expectedDeliveryDate;
    private LocalDate expectedEstimateSubmissionDate;
    private List<ProjectTeamMemberDTO> members;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Integer version;

    public ProjectTeamDetailDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTechnicalProjectDepartmentId() { return technicalProjectDepartmentId; }
    public void setTechnicalProjectDepartmentId(UUID technicalProjectDepartmentId) { this.technicalProjectDepartmentId = technicalProjectDepartmentId; }

    public UUID getTechnicalProjectId() { return technicalProjectId; }
    public void setTechnicalProjectId(UUID technicalProjectId) { this.technicalProjectId = technicalProjectId; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public ProjectTeamStatus getStatus() { return status; }
    public void setStatus(ProjectTeamStatus status) { this.status = status; }

    public TeamFormationStatus getFormationStatus() { return formationStatus; }
    public void setFormationStatus(TeamFormationStatus formationStatus) { this.formationStatus = formationStatus; }

    public String getRequiredScope() { return requiredScope; }
    public void setRequiredScope(String requiredScope) { this.requiredScope = requiredScope; }

    public LocalDate getExpectedStartDate() { return expectedStartDate; }
    public void setExpectedStartDate(LocalDate expectedStartDate) { this.expectedStartDate = expectedStartDate; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public LocalDate getExpectedEstimateSubmissionDate() { return expectedEstimateSubmissionDate; }
    public void setExpectedEstimateSubmissionDate(LocalDate expectedEstimateSubmissionDate) { this.expectedEstimateSubmissionDate = expectedEstimateSubmissionDate; }

    public List<ProjectTeamMemberDTO> getMembers() {
        return members != null ? members : Collections.emptyList();
    }
    public void setMembers(List<ProjectTeamMemberDTO> members) { this.members = members; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}

