package com.knoweb.salesmanagement.projectexecution.entity;

import com.knoweb.salesmanagement.projectexecution.enums.DelayStatus;
import com.knoweb.salesmanagement.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_delay_reports")
public class ProjectDelayReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private ProjectExecutionWorkspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private ProjectTask task;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "expected_delay_days", nullable = false)
    private Integer expectedDelayDays;

    @Column(name = "revised_expected_date")
    private LocalDate revisedExpectedDate;

    @Column(name = "impact_description", columnDefinition = "TEXT")
    private String impactDescription;

    @Column(name = "mitigation_plan", columnDefinition = "TEXT")
    private String mitigationPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private DelayStatus status = DelayStatus.REPORTED;

    @Column(name = "reported_by")
    private UUID reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

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
    public ProjectExecutionWorkspace getWorkspace() { return workspace; }
    public void setWorkspace(ProjectExecutionWorkspace workspace) { this.workspace = workspace; }
    public ProjectTask getTask() { return task; }
    public void setTask(ProjectTask task) { this.task = task; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Integer getExpectedDelayDays() { return expectedDelayDays; }
    public void setExpectedDelayDays(Integer expectedDelayDays) { this.expectedDelayDays = expectedDelayDays; }
    public LocalDate getRevisedExpectedDate() { return revisedExpectedDate; }
    public void setRevisedExpectedDate(LocalDate revisedExpectedDate) { this.revisedExpectedDate = revisedExpectedDate; }
    public String getImpactDescription() { return impactDescription; }
    public void setImpactDescription(String impactDescription) { this.impactDescription = impactDescription; }
    public String getMitigationPlan() { return mitigationPlan; }
    public void setMitigationPlan(String mitigationPlan) { this.mitigationPlan = mitigationPlan; }
    public DelayStatus getStatus() { return status; }
    public void setStatus(DelayStatus status) { this.status = status; }
    public UUID getReportedBy() { return reportedBy; }
    public void setReportedBy(UUID reportedBy) { this.reportedBy = reportedBy; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
