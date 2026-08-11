package com.knoweb.salesmanagement.projectexecution.dto;

import com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ExecutionWorkspaceDTO {
    private UUID id;
    private UUID technicalProjectId;
    private String projectCode;
    private UUID projectManagerId;
    private String projectManagerName;
    private ExecutionWorkspaceStatus status;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private BigDecimal overallProgress;
    private String executionNotes;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTechnicalProjectId() { return technicalProjectId; }
    public void setTechnicalProjectId(UUID technicalProjectId) { this.technicalProjectId = technicalProjectId; }
    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
    public UUID getProjectManagerId() { return projectManagerId; }
    public void setProjectManagerId(UUID projectManagerId) { this.projectManagerId = projectManagerId; }
    public String getProjectManagerName() { return projectManagerName; }
    public void setProjectManagerName(String projectManagerName) { this.projectManagerName = projectManagerName; }
    public ExecutionWorkspaceStatus getStatus() { return status; }
    public void setStatus(ExecutionWorkspaceStatus status) { this.status = status; }
    public LocalDate getPlannedStartDate() { return plannedStartDate; }
    public void setPlannedStartDate(LocalDate plannedStartDate) { this.plannedStartDate = plannedStartDate; }
    public LocalDate getPlannedEndDate() { return plannedEndDate; }
    public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; }
    public LocalDate getActualStartDate() { return actualStartDate; }
    public void setActualStartDate(LocalDate actualStartDate) { this.actualStartDate = actualStartDate; }
    public LocalDate getActualEndDate() { return actualEndDate; }
    public void setActualEndDate(LocalDate actualEndDate) { this.actualEndDate = actualEndDate; }
    public BigDecimal getOverallProgress() { return overallProgress; }
    public void setOverallProgress(BigDecimal overallProgress) { this.overallProgress = overallProgress; }
    public String getExecutionNotes() { return executionNotes; }
    public void setExecutionNotes(String executionNotes) { this.executionNotes = executionNotes; }

    private com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus inspectionStatus;
    private LocalDate inspectionDate;
    private String inspectionNotes;
    private LocalDate deliveryDate;
    private Boolean installationCompleted;
    private String deliveryNotes;

    public com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus getInspectionStatus() { return inspectionStatus; }
    public void setInspectionStatus(com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus inspectionStatus) { this.inspectionStatus = inspectionStatus; }
    public LocalDate getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(LocalDate inspectionDate) { this.inspectionDate = inspectionDate; }
    public String getInspectionNotes() { return inspectionNotes; }
    public void setInspectionNotes(String inspectionNotes) { this.inspectionNotes = inspectionNotes; }
    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }
    public Boolean getInstallationCompleted() { return installationCompleted; }
    public void setInstallationCompleted(Boolean installationCompleted) { this.installationCompleted = installationCompleted; }
    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }

    private Boolean clientAccepted;
    private LocalDate clientAcceptanceDate;
    private String clientAcceptanceNotes;

    private LocalDate warrantyStartDate;
    private LocalDate warrantyEndDate;
    private String warrantyNotes;

    private OffsetDateTime closedAt;
    private UUID closedBy;
    private String closedByName;

    public Boolean getClientAccepted() { return clientAccepted; }
    public void setClientAccepted(Boolean clientAccepted) { this.clientAccepted = clientAccepted; }
    public LocalDate getClientAcceptanceDate() { return clientAcceptanceDate; }
    public void setClientAcceptanceDate(LocalDate clientAcceptanceDate) { this.clientAcceptanceDate = clientAcceptanceDate; }
    public String getClientAcceptanceNotes() { return clientAcceptanceNotes; }
    public void setClientAcceptanceNotes(String clientAcceptanceNotes) { this.clientAcceptanceNotes = clientAcceptanceNotes; }
    public LocalDate getWarrantyStartDate() { return warrantyStartDate; }
    public void setWarrantyStartDate(LocalDate warrantyStartDate) { this.warrantyStartDate = warrantyStartDate; }
    public LocalDate getWarrantyEndDate() { return warrantyEndDate; }
    public void setWarrantyEndDate(LocalDate warrantyEndDate) { this.warrantyEndDate = warrantyEndDate; }
    public String getWarrantyNotes() { return warrantyNotes; }
    public void setWarrantyNotes(String warrantyNotes) { this.warrantyNotes = warrantyNotes; }

    public OffsetDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(OffsetDateTime closedAt) { this.closedAt = closedAt; }
    public UUID getClosedBy() { return closedBy; }
    public void setClosedBy(UUID closedBy) { this.closedBy = closedBy; }
    public String getClosedByName() { return closedByName; }
    public void setClosedByName(String closedByName) { this.closedByName = closedByName; }
}
