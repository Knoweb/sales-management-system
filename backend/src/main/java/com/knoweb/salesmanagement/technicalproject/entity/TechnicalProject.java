package com.knoweb.salesmanagement.technicalproject.entity;

import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "technical_projects")
public class TechnicalProject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_code", nullable = false, unique = true, length = 255)
    private String projectCode;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_brief_id", nullable = false, unique = true)
    private ProjectBrief projectBrief;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_opportunity_id")
    private SalesOpportunity salesOpportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_coordinator_id")
    private User technicalCoordinator;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private TechnicalProjectStatus status;

    @Column(name = "routed_at")
    private OffsetDateTime routedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    public TechnicalProject() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public ProjectBrief getProjectBrief() { return projectBrief; }
    public void setProjectBrief(ProjectBrief projectBrief) { this.projectBrief = projectBrief; }

    public SalesOpportunity getSalesOpportunity() { return salesOpportunity; }
    public void setSalesOpportunity(SalesOpportunity salesOpportunity) { this.salesOpportunity = salesOpportunity; }

    public User getTechnicalCoordinator() { return technicalCoordinator; }
    public void setTechnicalCoordinator(User technicalCoordinator) { this.technicalCoordinator = technicalCoordinator; }

    public TechnicalProjectStatus getStatus() { return status; }
    public void setStatus(TechnicalProjectStatus status) { this.status = status; }

    public OffsetDateTime getRoutedAt() { return routedAt; }
    public void setRoutedAt(OffsetDateTime routedAt) { this.routedAt = routedAt; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
