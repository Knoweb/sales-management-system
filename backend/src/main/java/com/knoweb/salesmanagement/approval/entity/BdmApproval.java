package com.knoweb.salesmanagement.approval.entity;

import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bdm_approvals")
public class BdmApproval {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private SalesOpportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_brief_id", nullable = false)
    private ProjectBrief projectBrief;

    @Column(name = "project_brief_version_number", nullable = false)
    private Integer projectBriefVersionNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private BdmApprovalStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_maker_id")
    private User decisionMaker;

    @Column(name = "decision_date")
    private OffsetDateTime decisionDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public BdmApproval() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public SalesOpportunity getOpportunity() { return opportunity; }
    public void setOpportunity(SalesOpportunity opportunity) { this.opportunity = opportunity; }
    public ProjectBrief getProjectBrief() { return projectBrief; }
    public void setProjectBrief(ProjectBrief projectBrief) { this.projectBrief = projectBrief; }
    public Integer getProjectBriefVersionNumber() { return projectBriefVersionNumber; }
    public void setProjectBriefVersionNumber(Integer projectBriefVersionNumber) { this.projectBriefVersionNumber = projectBriefVersionNumber; }
    public BdmApprovalStatus getStatus() { return status; }
    public void setStatus(BdmApprovalStatus status) { this.status = status; }
    public User getDecisionMaker() { return decisionMaker; }
    public void setDecisionMaker(User decisionMaker) { this.decisionMaker = decisionMaker; }
    public OffsetDateTime getDecisionDate() { return decisionDate; }
    public void setDecisionDate(OffsetDateTime decisionDate) { this.decisionDate = decisionDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
