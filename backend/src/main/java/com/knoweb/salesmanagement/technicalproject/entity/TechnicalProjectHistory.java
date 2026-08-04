package com.knoweb.salesmanagement.technicalproject.entity;

import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectHistoryAction;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "technical_project_history")
public class TechnicalProjectHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_project_id", nullable = false)
    private TechnicalProject technicalProject;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 100)
    private TechnicalProjectHistoryAction action;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "previous_value", columnDefinition = "jsonb")
    private String previousValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "jsonb")
    private String newValue;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acted_by")
    private User actedBy;

    @CreationTimestamp
    @Column(name = "acted_at", nullable = false, updatable = false)
    private OffsetDateTime actedAt;

    public TechnicalProjectHistory() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public TechnicalProject getTechnicalProject() { return technicalProject; }
    public void setTechnicalProject(TechnicalProject technicalProject) { this.technicalProject = technicalProject; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public TechnicalProjectHistoryAction getAction() { return action; }
    public void setAction(TechnicalProjectHistoryAction action) { this.action = action; }

    public String getPreviousValue() { return previousValue; }
    public void setPreviousValue(String previousValue) { this.previousValue = previousValue; }

    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public User getActedBy() { return actedBy; }
    public void setActedBy(User actedBy) { this.actedBy = actedBy; }

    public OffsetDateTime getActedAt() { return actedAt; }
}
