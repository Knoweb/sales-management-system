package com.knoweb.salesmanagement.technicalproject.entity;

import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.technicalproject.enums.TeamFormationStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "technical_project_departments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"technical_project_id", "department_id"})
})
public class TechnicalProjectDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_project_id", nullable = false)
    private TechnicalProject technicalProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "required_scope", nullable = false, columnDefinition = "TEXT")
    private String requiredScope;

    @Column(name = "expected_estimate_submission_date", nullable = false)
    private LocalDate expectedEstimateSubmissionDate;

    @Column(name = "routing_notes", columnDefinition = "TEXT")
    private String routingNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "formation_status", nullable = false, length = 50)
    private TeamFormationStatus formationStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    @Column(name = "assigned_at")
    private OffsetDateTime assignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    public TechnicalProjectDepartment() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public TechnicalProject getTechnicalProject() { return technicalProject; }
    public void setTechnicalProject(TechnicalProject technicalProject) { this.technicalProject = technicalProject; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public String getRequiredScope() { return requiredScope; }
    public void setRequiredScope(String requiredScope) { this.requiredScope = requiredScope; }

    public LocalDate getExpectedEstimateSubmissionDate() { return expectedEstimateSubmissionDate; }
    public void setExpectedEstimateSubmissionDate(LocalDate expectedEstimateSubmissionDate) { this.expectedEstimateSubmissionDate = expectedEstimateSubmissionDate; }

    public String getRoutingNotes() { return routingNotes; }
    public void setRoutingNotes(String routingNotes) { this.routingNotes = routingNotes; }

    public TeamFormationStatus getFormationStatus() { return formationStatus; }
    public void setFormationStatus(TeamFormationStatus formationStatus) { this.formationStatus = formationStatus; }

    public User getAssignedBy() { return assignedBy; }
    public void setAssignedBy(User assignedBy) { this.assignedBy = assignedBy; }

    public OffsetDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(OffsetDateTime assignedAt) { this.assignedAt = assignedAt; }

    public User getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(User submittedBy) { this.submittedBy = submittedBy; }

    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
