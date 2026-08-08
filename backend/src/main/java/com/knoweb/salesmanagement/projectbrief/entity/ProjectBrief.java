package com.knoweb.salesmanagement.projectbrief.entity;

import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "project_briefs")
public class ProjectBrief {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false, unique = true)
    private SalesOpportunity opportunity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ProjectBriefStatus status;

    @Column(name = "current_version_number", nullable = false)
    private Integer currentVersionNumber = 0;

    @Column(name = "project_title", length = 255)
    private String projectTitle;

    @Column(name = "business_problem", columnDefinition = "TEXT")
    private String businessProblem;

    @Column(name = "required_solution", columnDefinition = "TEXT")
    private String requiredSolution;

    @Column(name = "project_scope", columnDefinition = "TEXT")
    private String projectScope;

    @Column(name = "technical_requirements", columnDefinition = "TEXT")
    private String technicalRequirements;

    @Column(name = "expected_budget", precision = 19, scale = 2)
    private BigDecimal expectedBudget;

    @Column(length = 3)
    private String currency;

    @Column(name = "expected_deadline")
    private LocalDate expectedDeadline;

    @Column(name = "site_name", length = 255)
    private String siteName;

    @Column(name = "site_address", columnDefinition = "TEXT")
    private String siteAddress;

    @Column(name = "site_information", columnDefinition = "TEXT")
    private String siteInformation;

    @Column(name = "meeting_notes", columnDefinition = "TEXT")
    private String meetingNotes;

    @Column(name = "special_conditions", columnDefinition = "TEXT")
    private String specialConditions;

    @Column(name = "due_at", nullable = false)
    private OffsetDateTime dueAt;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "project_brief_departments",
        joinColumns = @JoinColumn(name = "project_brief_id"),
        inverseJoinColumns = @JoinColumn(name = "department_id")
    )
    private Set<Department> requiredDepartments = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    public ProjectBrief() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public SalesOpportunity getOpportunity() { return opportunity; }
    public void setOpportunity(SalesOpportunity opportunity) { this.opportunity = opportunity; }

    public ProjectBriefStatus getStatus() { return status; }
    public void setStatus(ProjectBriefStatus status) { this.status = status; }

    public Integer getCurrentVersionNumber() { return currentVersionNumber; }
    public void setCurrentVersionNumber(Integer currentVersionNumber) { this.currentVersionNumber = currentVersionNumber; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getBusinessProblem() { return businessProblem; }
    public void setBusinessProblem(String businessProblem) { this.businessProblem = businessProblem; }

    public String getRequiredSolution() { return requiredSolution; }
    public void setRequiredSolution(String requiredSolution) { this.requiredSolution = requiredSolution; }

    public String getProjectScope() { return projectScope; }
    public void setProjectScope(String projectScope) { this.projectScope = projectScope; }

    public String getTechnicalRequirements() { return technicalRequirements; }
    public void setTechnicalRequirements(String technicalRequirements) { this.technicalRequirements = technicalRequirements; }

    public BigDecimal getExpectedBudget() { return expectedBudget; }
    public void setExpectedBudget(BigDecimal expectedBudget) { this.expectedBudget = expectedBudget; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDate getExpectedDeadline() { return expectedDeadline; }
    public void setExpectedDeadline(LocalDate expectedDeadline) { this.expectedDeadline = expectedDeadline; }

    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }

    public String getSiteAddress() { return siteAddress; }
    public void setSiteAddress(String siteAddress) { this.siteAddress = siteAddress; }

    public String getSiteInformation() { return siteInformation; }
    public void setSiteInformation(String siteInformation) { this.siteInformation = siteInformation; }

    public String getMeetingNotes() { return meetingNotes; }
    public void setMeetingNotes(String meetingNotes) { this.meetingNotes = meetingNotes; }

    public String getSpecialConditions() { return specialConditions; }
    public void setSpecialConditions(String specialConditions) { this.specialConditions = specialConditions; }

    public OffsetDateTime getDueAt() { return dueAt; }
    public void setDueAt(OffsetDateTime dueAt) { this.dueAt = dueAt; }

    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }

    public User getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(User submittedBy) { this.submittedBy = submittedBy; }

    public Set<Department> getRequiredDepartments() { return requiredDepartments; }
    public void setRequiredDepartments(Set<Department> requiredDepartments) { this.requiredDepartments = requiredDepartments; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
}
