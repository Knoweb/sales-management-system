package com.knoweb.salesmanagement.technicalproject.entity;

import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectTeamStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_teams")
public class ProjectTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_project_department_id", nullable = false, unique = true)
    private TechnicalProjectDepartment technicalProjectDepartment;

    @Column(name = "team_name", length = 255)
    private String teamName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ProjectTeamStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    public ProjectTeam() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public TechnicalProjectDepartment getTechnicalProjectDepartment() { return technicalProjectDepartment; }
    public void setTechnicalProjectDepartment(TechnicalProjectDepartment technicalProjectDepartment) { this.technicalProjectDepartment = technicalProjectDepartment; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public ProjectTeamStatus getStatus() { return status; }
    public void setStatus(ProjectTeamStatus status) { this.status = status; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
