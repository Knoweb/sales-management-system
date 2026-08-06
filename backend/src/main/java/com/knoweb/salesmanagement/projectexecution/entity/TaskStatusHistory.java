package com.knoweb.salesmanagement.projectexecution.entity;

import com.knoweb.salesmanagement.projectexecution.enums.TaskStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_status_history")
public class TaskStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private ProjectTask task;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 50)
    private TaskStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 50)
    private TaskStatus newStatus;

    @Column(name = "previous_percentage", precision = 5, scale = 2)
    private BigDecimal previousPercentage;

    @Column(name = "new_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal newPercentage;

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
    public ProjectTask getTask() { return task; }
    public void setTask(ProjectTask task) { this.task = task; }
    public TaskStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(TaskStatus previousStatus) { this.previousStatus = previousStatus; }
    public TaskStatus getNewStatus() { return newStatus; }
    public void setNewStatus(TaskStatus newStatus) { this.newStatus = newStatus; }
    public BigDecimal getPreviousPercentage() { return previousPercentage; }
    public void setPreviousPercentage(BigDecimal previousPercentage) { this.previousPercentage = previousPercentage; }
    public BigDecimal getNewPercentage() { return newPercentage; }
    public void setNewPercentage(BigDecimal newPercentage) { this.newPercentage = newPercentage; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public UUID getChangedBy() { return changedBy; }
    public void setChangedBy(UUID changedBy) { this.changedBy = changedBy; }
    public OffsetDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(OffsetDateTime changedAt) { this.changedAt = changedAt; }
}
