package com.knoweb.salesmanagement.projectexecution.entity;

import com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.user.entity.User;
import jakarta.persistence.*;
import com.knoweb.salesmanagement.employee.entity.Employee;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_execution_workspaces")
public class ProjectExecutionWorkspace {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_project_id", nullable = false, unique = true)
    private TechnicalProject technicalProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_manager_id")
    private Employee projectManager;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ExecutionWorkspaceStatus status = ExecutionWorkspaceStatus.PLANNED;

    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    @Column(name = "actual_start_date")
    private LocalDate actualStartDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Column(name = "overall_progress", precision = 5, scale = 2)
    private BigDecimal overallProgress = BigDecimal.ZERO;

    @Column(name = "execution_notes")
    private String executionNotes;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_status", nullable = false, length = 50)
    private com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus inspectionStatus = com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus.PENDING;

    @Column(name = "inspection_date")
    private LocalDate inspectionDate;

    @Column(name = "inspection_notes")
    private String inspectionNotes;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "installation_completed", nullable = false)
    private Boolean installationCompleted = false;

    @Column(name = "delivery_notes")
    private String deliveryNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public TechnicalProject getTechnicalProject() { return technicalProject; }
    public void setTechnicalProject(TechnicalProject technicalProject) { this.technicalProject = technicalProject; }
    public Employee getProjectManager() { return projectManager; }
    public void setProjectManager(Employee projectManager) { this.projectManager = projectManager; }
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
    public BigDecimal getOverallProgress() {
        return overallProgress;
    }
    public void setOverallProgress(BigDecimal overallProgress) {
        this.overallProgress = overallProgress;
    }
    public String getExecutionNotes() {
        return executionNotes;
    }
    public void setExecutionNotes(String executionNotes) {
        this.executionNotes = executionNotes;
    }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
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
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
