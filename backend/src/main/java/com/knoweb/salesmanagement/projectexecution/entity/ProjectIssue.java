package com.knoweb.salesmanagement.projectexecution.entity;

import com.knoweb.salesmanagement.projectexecution.enums.IssueSeverity;
import com.knoweb.salesmanagement.projectexecution.enums.IssueStatus;
import com.knoweb.salesmanagement.user.entity.User;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_issues")
public class ProjectIssue {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private ProjectExecutionWorkspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private ProjectTask task;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 50)
    private IssueSeverity severity = IssueSeverity.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private IssueStatus status = IssueStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "reported_by")
    private UUID reportedBy;

    @Column(name = "reported_date", nullable = false, updatable = false)
    private OffsetDateTime reportedDate;

    @Column(name = "resolved_date")
    private OffsetDateTime resolvedDate;

    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @PrePersist
    protected void onCreate() {
        if (reportedDate == null) { reportedDate = OffsetDateTime.now(); }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProjectExecutionWorkspace getWorkspace() { return workspace; }
    public void setWorkspace(ProjectExecutionWorkspace workspace) { this.workspace = workspace; }
    public ProjectTask getTask() { return task; }
    public void setTask(ProjectTask task) { this.task = task; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public IssueSeverity getSeverity() { return severity; }
    public void setSeverity(IssueSeverity severity) { this.severity = severity; }
    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public UUID getReportedBy() { return reportedBy; }
    public void setReportedBy(UUID reportedBy) { this.reportedBy = reportedBy; }
    public OffsetDateTime getReportedDate() { return reportedDate; }
    public void setReportedDate(OffsetDateTime reportedDate) { this.reportedDate = reportedDate; }
    public OffsetDateTime getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(OffsetDateTime resolvedDate) { this.resolvedDate = resolvedDate; }
    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
