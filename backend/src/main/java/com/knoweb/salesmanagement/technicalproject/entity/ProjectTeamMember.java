package com.knoweb.salesmanagement.technicalproject.entity;

import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectRole;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectTeamMemberStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_team_members")
public class ProjectTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_team_id", nullable = false)
    private ProjectTeam projectTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_role", nullable = false, length = 100)
    private ProjectRole projectRole;

    @NotNull
    @Column(name = "allocation_start_date", nullable = false)
    private LocalDate allocationStartDate;

    @NotNull
    @Column(name = "allocation_end_date", nullable = false)
    private LocalDate allocationEndDate;

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(name = "assigned_hours", nullable = false, precision = 19, scale = 2)
    private BigDecimal assignedHours;

    @Column(name = "is_primary_member", nullable = false)
    private boolean primaryMember = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ProjectTeamMemberStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by")
    private User addedBy;

    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private OffsetDateTime addedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public ProjectTeamMember() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ProjectTeam getProjectTeam() { return projectTeam; }
    public void setProjectTeam(ProjectTeam projectTeam) { this.projectTeam = projectTeam; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public ProjectRole getProjectRole() { return projectRole; }
    public void setProjectRole(ProjectRole projectRole) { this.projectRole = projectRole; }

    public LocalDate getAllocationStartDate() { return allocationStartDate; }
    public void setAllocationStartDate(LocalDate allocationStartDate) { this.allocationStartDate = allocationStartDate; }

    public LocalDate getAllocationEndDate() { return allocationEndDate; }
    public void setAllocationEndDate(LocalDate allocationEndDate) { this.allocationEndDate = allocationEndDate; }

    public BigDecimal getAssignedHours() { return assignedHours; }
    public void setAssignedHours(BigDecimal assignedHours) { this.assignedHours = assignedHours; }

    public boolean isPrimaryMember() { return primaryMember; }
    public void setPrimaryMember(boolean primaryMember) { this.primaryMember = primaryMember; }

    public ProjectTeamMemberStatus getStatus() { return status; }
    public void setStatus(ProjectTeamMemberStatus status) { this.status = status; }

    public User getAddedBy() { return addedBy; }
    public void setAddedBy(User addedBy) { this.addedBy = addedBy; }

    public OffsetDateTime getAddedAt() { return addedAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
