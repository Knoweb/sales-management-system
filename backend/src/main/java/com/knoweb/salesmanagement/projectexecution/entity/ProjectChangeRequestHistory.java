package com.knoweb.salesmanagement.projectexecution.entity;

import com.knoweb.salesmanagement.projectexecution.enums.ChangeRequestStatus;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_change_request_history")
public class ProjectChangeRequestHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "change_request_id", nullable = false)
    private ProjectChangeRequest changeRequest;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 50)
    private ChangeRequestStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 50)
    private ChangeRequestStatus newStatus;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "changed_by")
    private UUID changedBy;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private OffsetDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) { changedAt = OffsetDateTime.now(); }
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProjectChangeRequest getChangeRequest() { return changeRequest; }
    public void setChangeRequest(ProjectChangeRequest changeRequest) { this.changeRequest = changeRequest; }
    public ChangeRequestStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(ChangeRequestStatus previousStatus) { this.previousStatus = previousStatus; }
    public ChangeRequestStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ChangeRequestStatus newStatus) { this.newStatus = newStatus; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public UUID getChangedBy() { return changedBy; }
    public void setChangedBy(UUID changedBy) { this.changedBy = changedBy; }
    public OffsetDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(OffsetDateTime changedAt) { this.changedAt = changedAt; }
}
