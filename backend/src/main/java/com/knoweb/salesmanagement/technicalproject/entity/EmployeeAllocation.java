package com.knoweb.salesmanagement.technicalproject.entity;

import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.technicalproject.enums.EmployeeAllocationStatus;
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
@Table(name = "employee_allocations")
public class EmployeeAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_project_id", nullable = false)
    private TechnicalProject technicalProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_team_id", nullable = false)
    private ProjectTeam projectTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private EmployeeAllocationStatus status;

    @Column(name = "override_flag", nullable = false)
    private boolean overrideFlag = false;

    @Column(name = "override_reason", columnDefinition = "TEXT")
    private String overrideReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "overridden_by")
    private User overriddenBy;

    @Column(name = "overridden_at")
    private OffsetDateTime overriddenAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public EmployeeAllocation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public TechnicalProject getTechnicalProject() { return technicalProject; }
    public void setTechnicalProject(TechnicalProject technicalProject) { this.technicalProject = technicalProject; }

    public ProjectTeam getProjectTeam() { return projectTeam; }
    public void setProjectTeam(ProjectTeam projectTeam) { this.projectTeam = projectTeam; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public LocalDate getAllocationStartDate() { return allocationStartDate; }
    public void setAllocationStartDate(LocalDate allocationStartDate) { this.allocationStartDate = allocationStartDate; }

    public LocalDate getAllocationEndDate() { return allocationEndDate; }
    public void setAllocationEndDate(LocalDate allocationEndDate) { this.allocationEndDate = allocationEndDate; }

    public BigDecimal getAssignedHours() { return assignedHours; }
    public void setAssignedHours(BigDecimal assignedHours) { this.assignedHours = assignedHours; }

    public EmployeeAllocationStatus getStatus() { return status; }
    public void setStatus(EmployeeAllocationStatus status) { this.status = status; }

    public boolean isOverrideFlag() { return overrideFlag; }
    public void setOverrideFlag(boolean overrideFlag) { this.overrideFlag = overrideFlag; }

    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }

    public User getOverriddenBy() { return overriddenBy; }
    public void setOverriddenBy(User overriddenBy) { this.overriddenBy = overriddenBy; }

    public OffsetDateTime getOverriddenAt() { return overriddenAt; }
    public void setOverriddenAt(OffsetDateTime overriddenAt) { this.overriddenAt = overriddenAt; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
