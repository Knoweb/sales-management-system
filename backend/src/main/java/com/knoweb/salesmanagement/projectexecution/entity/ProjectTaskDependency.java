package com.knoweb.salesmanagement.projectexecution.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_task_dependencies", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"task_id", "predecessor_task_id"})
})
public class ProjectTaskDependency {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private ProjectTask task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "predecessor_task_id", nullable = false)
    private ProjectTask predecessor;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProjectTask getTask() { return task; }
    public void setTask(ProjectTask task) { this.task = task; }
    public ProjectTask getPredecessor() { return predecessor; }
    public void setPredecessor(ProjectTask predecessor) { this.predecessor = predecessor; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
