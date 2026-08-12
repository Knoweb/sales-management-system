package com.knoweb.salesmanagement.technicalproject.service;

import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.department.entity.DepartmentHead;
import com.knoweb.salesmanagement.department.repository.DepartmentHeadRepository;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.leave.entity.EmployeeLeave;
import com.knoweb.salesmanagement.leave.enums.LeaveStatus;
import com.knoweb.salesmanagement.leave.repository.EmployeeLeaveRepository;
import com.knoweb.salesmanagement.skill.entity.EmployeeSkill;
import com.knoweb.salesmanagement.skill.repository.EmployeeSkillRepository;
import com.knoweb.salesmanagement.technicalproject.dto.*;
import com.knoweb.salesmanagement.technicalproject.entity.*;
import com.knoweb.salesmanagement.technicalproject.enums.*;
import com.knoweb.salesmanagement.technicalproject.repository.*;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@Transactional
public class ProjectTeamManagementService {

    private final TechnicalProjectDepartmentRepository departmentAssignmentRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final ProjectTeamMemberRepository teamMemberRepository;
    private final EmployeeAllocationRepository allocationRepository;
    private final TechnicalProjectRepository technicalProjectRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeLeaveRepository leaveRepository;
    private final EmployeeSkillRepository skillRepository;
    private final DepartmentHeadRepository departmentHeadRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final TechnicalProjectHistoryHelper historyHelper;
    private final com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository workspaceRepository;

    public ProjectTeamManagementService(
            TechnicalProjectDepartmentRepository departmentAssignmentRepository,
            ProjectTeamRepository projectTeamRepository,
            ProjectTeamMemberRepository teamMemberRepository,
            EmployeeAllocationRepository allocationRepository,
            TechnicalProjectRepository technicalProjectRepository,
            EmployeeRepository employeeRepository,
            EmployeeLeaveRepository leaveRepository,
            EmployeeSkillRepository skillRepository,
            DepartmentHeadRepository departmentHeadRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            TechnicalProjectHistoryHelper historyHelper,
            com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository workspaceRepository) {
        this.departmentAssignmentRepository = departmentAssignmentRepository;
        this.projectTeamRepository = projectTeamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.allocationRepository = allocationRepository;
        this.technicalProjectRepository = technicalProjectRepository;
        this.employeeRepository = employeeRepository;
        this.leaveRepository = leaveRepository;
        this.skillRepository = skillRepository;
        this.departmentHeadRepository = departmentHeadRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.historyHelper = historyHelper;
        this.workspaceRepository = workspaceRepository;
    }

    // ========================================================================================
    // Security helpers
    // ========================================================================================

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication(); System.out.println("==== AUTH ==== " + auth);
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private boolean hasAuthority(String authority) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication(); System.out.println("==== AUTH ==== " + auth);
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(authority));
    }

    /** Returns the active DepartmentHead record for the current user, or empty. */
    private Optional<DepartmentHead> getActiveHeadshipForCurrentUser() {
        User user = getAuthenticatedUser();
        if (user == null) return Optional.empty();
        Optional<Employee> emp = employeeRepository.findByUserId(user.getId());
        if (emp.isEmpty()) return Optional.empty();
        return departmentHeadRepository.findByEmployeeIdAndActiveTrue(emp.get().getId());
    }

    /**
     * Validates that the current user is either an admin/coordinator (global) or
     * the active HOD of the given department. Throws AccessDeniedException otherwise.
     */
    private void validateDepartmentAccess(UUID departmentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication(); System.out.println("==== AUTH ==== " + auth);
        if (auth == null) throw new AccessDeniedException("Not authenticated");
        boolean isGlobal = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ROLE_SYSTEM_ADMIN") || r.equals("ROLE_TECHNICAL_COORDINATOR"));
        if (isGlobal) return;

        Optional<DepartmentHead> head = getActiveHeadshipForCurrentUser();
        if (head.isEmpty() || !head.get().getDepartment().getId().equals(departmentId)) {
            throw new AccessDeniedException("You are not authorised to manage teams for department " + departmentId);
        }
    }

    private boolean isProjectClosed(TechnicalProject tp) {
        return workspaceRepository.findByTechnicalProjectId(tp.getId())
                .map(workspace -> workspace.getStatus() == com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus.CLOSED)
                .orElse(false);
    }

    private void validateProjectNotClosed(TechnicalProject tp) {
        if (isProjectClosed(tp)) {
            throw new ResourceConflictException("Cannot modify team for a CLOSED project workspace");
        }
    }

    // ========================================================================================
    // HOD Queue: assigned projects
    // ========================================================================================

    @Transactional(readOnly = true)
    public Page<AssignedProjectSummaryDTO> getAssignedProjects(UUID departmentId, Pageable pageable) {
        validateDepartmentAccess(departmentId);

        // Return all assignment statuses so HOD sees the full picture
        Page<TechnicalProjectDepartment> page = departmentAssignmentRepository
                .findByDepartmentId(departmentId, pageable);

        return page.map(tpd -> {
            TechnicalProject tp = tpd.getTechnicalProject();
            var pb = tp.getProjectBrief();
            var opp = tp != null ? tp.getSalesOpportunity() : null;
            var client = opp != null ? opp.getClient() : null;

            UUID teamId = projectTeamRepository.findByTechnicalProjectDepartmentId(tpd.getId())
                    .map(ProjectTeam::getId).orElse(null);

            return new AssignedProjectSummaryDTO(
                    tpd.getId(),
                    tp.getId(),
                    tp.getProjectCode(),
                    tp.getStatus(),
                    pb != null ? pb.getProjectTitle() : null,
                    client != null ? client.getName() : null,
                    tpd.getRequiredScope(),
                    tpd.getExpectedEstimateSubmissionDate(),
                    tpd.getFormationStatus(),
                    teamId,
                    tpd.getAssignedAt()
            );
        });
    }

    // ========================================================================================
    // Availability Search
    // ========================================================================================

    @Transactional(readOnly = true)
    public List<EmployeeAvailabilityDTO> searchAvailability(UUID departmentId,
                                                            LocalDate startDate,
                                                            LocalDate endDate,
                                                            List<UUID> skillIds,
                                                            BigDecimal proposedHours) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("startDate and endDate are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("startDate cannot be after endDate");
        }

        // Load active employees in the department (or all if no dept filter)
        List<Employee> employees;
        if (departmentId != null) {
            validateDepartmentAccess(departmentId);
            employees = employeeRepository.findActiveByDepartmentId(departmentId);
        } else {
            Optional<DepartmentHead> head = getActiveHeadshipForCurrentUser();
            if (head.isPresent()) {
                UUID hodDeptId = head.get().getDepartment().getId();
                employees = employeeRepository.findActiveByDepartmentId(hodDeptId);
            } else {
                validateDepartmentAccess(null);
                employees = employeeRepository.findByEmploymentStatus(EmploymentStatus.ACTIVE);
            }
        }


        // Filter by skills if specified
        if (skillIds != null && !skillIds.isEmpty()) {
            employees = employees.stream()
                    .filter(e -> skillIds.stream().allMatch(
                            sid -> skillRepository.existsByEmployeeIdAndSkillId(e.getId(), sid)))
                    .collect(Collectors.toList());
        }

        return employees.stream()
                .map(e -> buildAvailabilityDTO(e, startDate, endDate, proposedHours))
                .collect(Collectors.toList());
    }

    private EmployeeAvailabilityDTO buildAvailabilityDTO(Employee employee, LocalDate startDate,
                                                          LocalDate endDate, BigDecimal proposedHours) {
        EmployeeAvailabilityDTO dto = new EmployeeAvailabilityDTO();
        dto.setEmployeeId(employee.getId());
        dto.setEmployeeNumber(employee.getEmployeeNumber());
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dto.setJobTitle(employee.getJobTitle());
        dto.setDepartmentId(employee.getDepartment().getId());
        dto.setDepartmentName(employee.getDepartment().getName());
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setWeeklyCapacityHours(employee.getWeeklyCapacityHours());

        // 1. Working capacity
        long workingDays = calculateWorkingDays(startDate, endDate);
        BigDecimal dailyCap = employee.getWeeklyCapacityHours().divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);
        BigDecimal capacity = dailyCap.multiply(BigDecimal.valueOf(workingDays));
        dto.setEstimatedCapacityHours(capacity);

        // 2. Approved leave hours in window
        List<EmployeeLeave> leaves = leaveRepository.findOverlappingLeaves(
                employee.getId(), startDate, endDate, LeaveStatus.APPROVED);
        BigDecimal leaveHours = BigDecimal.ZERO;
        for (EmployeeLeave leave : leaves) {
            if (leave.isPartialDay() && leave.getLeaveHours() != null) {
                leaveHours = leaveHours.add(leave.getLeaveHours());
            } else {
                LocalDate overlapStart = startDate.isAfter(leave.getStartDate()) ? startDate : leave.getStartDate();
                LocalDate overlapEnd = endDate.isBefore(leave.getEndDate()) ? endDate : leave.getEndDate();
                long leaveDays = calculateWorkingDays(overlapStart, overlapEnd);
                leaveHours = leaveHours.add(dailyCap.multiply(BigDecimal.valueOf(leaveDays)));
            }
        }
        dto.setApprovedLeaveHours(leaveHours);

        // 3. Active overlapping allocations
        BigDecimal allocHours = allocationRepository.sumActiveOverlappingHours(
                employee.getId(), startDate, endDate, EmployeeAllocationStatus.ACTIVE);
        if (allocHours == null) allocHours = BigDecimal.ZERO;
        dto.setActiveAllocationHours(allocHours);

        // 4. Net available = capacity - leave - allocations
        BigDecimal available = capacity.subtract(leaveHours).subtract(allocHours);
        if (available.compareTo(BigDecimal.ZERO) < 0) available = BigDecimal.ZERO;
        dto.setEstimatedAvailableHours(available);

        // 5. Percentage relative to capacity
        if (capacity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal pct = available.divide(capacity, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            dto.setAvailabilityPercentage(pct.setScale(2, RoundingMode.HALF_UP));
        } else {
            dto.setAvailabilityPercentage(BigDecimal.ZERO);
        }

        // 6. Status label
        BigDecimal pct = dto.getAvailabilityPercentage();
        if (pct.compareTo(BigDecimal.valueOf(80)) >= 0) {
            dto.setAvailabilityStatus("AVAILABLE");
        } else if (pct.compareTo(BigDecimal.valueOf(30)) >= 0) {
            dto.setAvailabilityStatus("PARTIALLY_AVAILABLE");
        } else {
            dto.setAvailabilityStatus("UNAVAILABLE");
        }

        // 7. Skill names
        List<String> skillNames = skillRepository.findByEmployeeId(employee.getId()).stream()
                .map(es -> es.getSkill().getName())
                .collect(Collectors.toList());
        dto.setSkills(skillNames);

        // 8. Conflicts and available flag
        List<String> conflicts = new ArrayList<>();
        if (leaveHours.compareTo(BigDecimal.ZERO) > 0) {
            conflicts.add("Overlapping approved leave: " + leaveHours + " hrs");
        }
        if (allocHours.compareTo(BigDecimal.ZERO) > 0) {
            conflicts.add("Overlapping active allocations: " + allocHours + " hrs");
        }
        if (available.compareTo(BigDecimal.ZERO) <= 0) {
            conflicts.add("No remaining available capacity");
        }
        dto.setConflicts(conflicts);
        dto.setAvailable(conflicts.isEmpty() && !"UNAVAILABLE".equals(dto.getAvailabilityStatus()));


        return dto;
    }


    // ========================================================================================
    // Team CRUD
    // ========================================================================================

    /**
     * Create or return the single team for a TechnicalProjectDepartment.
     * Sets department formation status to IN_PROGRESS.
     */
    public ProjectTeamDetailDTO createOrGetTeam(UUID technicalProjectDepartmentId, String teamName) {
        TechnicalProjectDepartment tpd = departmentAssignmentRepository.findById(technicalProjectDepartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department assignment not found"));

        validateDepartmentAccess(tpd.getDepartment().getId());

        Optional<ProjectTeam> existing = projectTeamRepository.findByTechnicalProjectDepartmentId(technicalProjectDepartmentId);
        if (existing.isPresent()) {
            return buildTeamDetailDTO(existing.get());
        }

        User actor = getAuthenticatedUser();
        TechnicalProject tp = tpd.getTechnicalProject();

        ProjectTeam team = new ProjectTeam();
        team.setTechnicalProjectDepartment(tpd);
        team.setTeamName(teamName);
        team.setStatus(ProjectTeamStatus.DRAFT);
        team.setCreatedBy(actor);
        team = projectTeamRepository.save(team);

        // Set department status to IN_PROGRESS
        tpd.setFormationStatus(TeamFormationStatus.IN_PROGRESS);
        departmentAssignmentRepository.save(tpd);

        // Update project status to TEAM_FORMATION_IN_PROGRESS if it's ROUTED
        if (tp.getStatus() == TechnicalProjectStatus.ROUTED) {
            tp.setStatus(TechnicalProjectStatus.TEAM_FORMATION_IN_PROGRESS);
            technicalProjectRepository.save(tp);
        }

        historyHelper.recordAction(tp, TechnicalProjectHistoryAction.TEAM_CREATED,
                null, "Team created for department: " + tpd.getDepartment().getName(),
                null, actor != null ? actor.getId() : null);

        return buildTeamDetailDTO(team);
    }

    @Transactional(readOnly = true)
    public ProjectTeamDetailDTO getTeamDetail(UUID teamId) {
        ProjectTeam team = projectTeamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Project team not found"));
        validateDepartmentAccess(team.getTechnicalProjectDepartment().getDepartment().getId());
        return buildTeamDetailDTO(team);
    }

    // ========================================================================================
    // Member management
    // ========================================================================================

    /**
     * Add a member to a team. Validates department membership, dates, duplicates,
     * leave, overlap, and capacity. Supports override when the caller has the right permission.
     */
    public ProjectTeamDetailDTO addMember(UUID teamId, AddTeamMemberRequest request) {
        ProjectTeam team = projectTeamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Project team not found"));

        TechnicalProjectDepartment tpd = team.getTechnicalProjectDepartment();
        validateDepartmentAccess(tpd.getDepartment().getId());

        validateDates(request.getAllocationStartDate(), request.getAllocationEndDate());
        validatePositiveHours(request.getAssignedHours());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + request.getEmployeeId()));

        // Employee must be active and belong to the routed department
        if (employee.getEmploymentStatus() != EmploymentStatus.ACTIVE) {
            throw new ResourceConflictException("Employee is not active: " + employee.getEmployeeNumber());
        }
        if (!employee.getDepartment().getId().equals(tpd.getDepartment().getId())) {
            throw new ResourceConflictException(
                    "Employee " + employee.getEmployeeNumber() + " does not belong to department " + tpd.getDepartment().getName());
        }

        // Prevent duplicate active membership in this team
        boolean alreadyMember = teamMemberRepository.existsByProjectTeamIdAndEmployeeIdAndStatus(
                teamId, employee.getId(), ProjectTeamMemberStatus.ACTIVE);
        if (alreadyMember) {
            throw new ResourceConflictException("Employee " + employee.getEmployeeNumber() + " is already an active member of this team");
        }

        User actor = getAuthenticatedUser();
        TechnicalProject tp = tpd.getTechnicalProject();

        validateProjectNotClosed(tp);

        // Conflict checks (leave, overlap, capacity)
        boolean override = performConflictChecks(employee, request.getAllocationStartDate(),
                request.getAllocationEndDate(), request.getAssignedHours(),
                null, request.isOverrideRequested(), request.getOverrideReason());

        // Persist member
        ProjectTeamMember member = new ProjectTeamMember();
        member.setProjectTeam(team);
        member.setEmployee(employee);
        member.setProjectRole(request.getProjectRole());
        member.setAllocationStartDate(request.getAllocationStartDate());
        member.setAllocationEndDate(request.getAllocationEndDate());
        member.setAssignedHours(request.getAssignedHours());
        member.setPrimaryMember(request.isPrimaryMember());
        member.setStatus(ProjectTeamMemberStatus.ACTIVE);
        member.setAddedBy(actor);
        member = teamMemberRepository.save(member);

        // Persist allocation
        EmployeeAllocation allocation = new EmployeeAllocation();
        allocation.setEmployee(employee);
        allocation.setTechnicalProject(tp);
        allocation.setProjectTeam(team);
        allocation.setDepartment(tpd.getDepartment());
        allocation.setAllocationStartDate(request.getAllocationStartDate());
        allocation.setAllocationEndDate(request.getAllocationEndDate());
        allocation.setAssignedHours(request.getAssignedHours());
        allocation.setStatus(EmployeeAllocationStatus.ACTIVE);
        allocation.setCreatedBy(actor != null ? actor.getId() : null);

        if (override) {
            allocation.setOverrideFlag(true);
            allocation.setOverrideReason(request.getOverrideReason());
            allocation.setOverriddenBy(actor);
            allocation.setOverriddenAt(OffsetDateTime.now());
        }
        allocationRepository.save(allocation);

        // Update department formation to IN_PROGRESS
        if (tpd.getFormationStatus() == TeamFormationStatus.PENDING) {
            tpd.setFormationStatus(TeamFormationStatus.IN_PROGRESS);
            departmentAssignmentRepository.save(tpd);
        }

        String memberDesc = employee.getFirstName() + " " + employee.getLastName() + " (" + employee.getEmployeeNumber() + ")";
        historyHelper.recordAction(tp, TechnicalProjectHistoryAction.TEAM_MEMBER_ADDED,
                null, "Member added: " + memberDesc, null, actor != null ? actor.getId() : null);

        if (override) {
            historyHelper.recordAction(tp, TechnicalProjectHistoryAction.ALLOCATION_OVERRIDE_USED,
                    null, "Override used for: " + memberDesc + " Reason: " + request.getOverrideReason(),
                    request.getOverrideReason(), actor != null ? actor.getId() : null);
        }

        return buildTeamDetailDTO(projectTeamRepository.findByIdWithDetails(teamId).orElseThrow());
    }

    /**
     * Update a member's allocation. Cancels the old allocation and creates a new one atomically.
     */
    public ProjectTeamDetailDTO updateMemberAllocation(UUID teamId, UUID memberId, UpdateMemberAllocationRequest request) {
        ProjectTeam team = projectTeamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Project team not found"));

        TechnicalProjectDepartment tpd = team.getTechnicalProjectDepartment();
        validateDepartmentAccess(tpd.getDepartment().getId());

        if (team.getStatus() != ProjectTeamStatus.READY) {
            throw new ResourceConflictException("Cannot update members before the team is marked READY");
        }

        ProjectTeamMember member = teamMemberRepository.findByIdAndProjectTeamId(memberId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this team"));

        if (member.getStatus() == ProjectTeamMemberStatus.REMOVED) {
            throw new ResourceConflictException("Cannot update a removed member");
        }

        validateDates(request.getAllocationStartDate(), request.getAllocationEndDate());
        validatePositiveHours(request.getAssignedHours());

        User actor = getAuthenticatedUser();
        TechnicalProject tp = tpd.getTechnicalProject();

        validateProjectNotClosed(tp);

        // Find existing active allocation for this exact assignment
        List<EmployeeAllocation> existingAllocs = allocationRepository.findByProjectTeamIdAndStatus(
                teamId, EmployeeAllocationStatus.ACTIVE).stream()
                .filter(a -> a.getEmployee().getId().equals(member.getEmployee().getId())
                          && a.getAllocationStartDate().equals(member.getAllocationStartDate())
                          && a.getAllocationEndDate().equals(member.getAllocationEndDate()))
                .collect(Collectors.toList());
                
        if (existingAllocs.isEmpty()) {
            throw new ResourceNotFoundException("Active allocation not found for this member");
        }
        EmployeeAllocation currentAlloc = existingAllocs.get(0);

        boolean onlyRoleChanged = member.getAllocationStartDate().equals(request.getAllocationStartDate()) &&
                                  member.getAllocationEndDate().equals(request.getAllocationEndDate()) &&
                                  member.getAssignedHours().compareTo(request.getAssignedHours()) == 0;

        if (!onlyRoleChanged) {
            performConflictChecks(member.getEmployee(),
                    request.getAllocationStartDate(), request.getAllocationEndDate(), request.getAssignedHours(),
                    currentAlloc.getId(), false, null);
        }

        // Update member
        member.setProjectRole(request.getProjectRole());
        member.setAllocationStartDate(request.getAllocationStartDate());
        member.setAllocationEndDate(request.getAllocationEndDate());
        member.setAssignedHours(request.getAssignedHours());
        member.setPrimaryMember(request.isPrimaryMember());
        teamMemberRepository.save(member);

        // Update existing allocation row directly
        currentAlloc.setAllocationStartDate(request.getAllocationStartDate());
        currentAlloc.setAllocationEndDate(request.getAllocationEndDate());
        currentAlloc.setAssignedHours(request.getAssignedHours());
        currentAlloc.setCreatedBy(actor != null ? actor.getId() : null);


        allocationRepository.save(currentAlloc);

        String memberDesc = member.getEmployee().getFirstName() + " " + member.getEmployee().getLastName();
        historyHelper.recordAction(tp, TechnicalProjectHistoryAction.ALLOCATION_UPDATED,
                null, "Allocation updated for: " + memberDesc, null, actor != null ? actor.getId() : null);



        return buildTeamDetailDTO(projectTeamRepository.findByIdWithDetails(teamId).orElseThrow());
    }

    /**
     * Remove a member from a team (soft-delete). Cancels the corresponding allocation.
     */
    public ProjectTeamDetailDTO removeMember(UUID teamId, UUID memberId) {
        ProjectTeam team = projectTeamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Project team not found"));

        TechnicalProjectDepartment tpd = team.getTechnicalProjectDepartment();
        validateDepartmentAccess(tpd.getDepartment().getId());

        if (team.getStatus() == ProjectTeamStatus.READY) {
            throw new ResourceConflictException("Cannot remove members from a team that is already READY");
        }

        ProjectTeamMember member = teamMemberRepository.findByIdAndProjectTeamId(memberId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this team"));

        if (member.getStatus() == ProjectTeamMemberStatus.REMOVED) {
            throw new ResourceConflictException("Member is already removed");
        }

        User actor = getAuthenticatedUser();
        TechnicalProject tp = tpd.getTechnicalProject();

        validateProjectNotClosed(tp);

        // Cancel active allocations for this member in this team
        allocationRepository.findByProjectTeamIdAndStatus(teamId, EmployeeAllocationStatus.ACTIVE).stream()
                .filter(a -> a.getEmployee().getId().equals(member.getEmployee().getId()))
                .forEach(a -> {
                    a.setStatus(EmployeeAllocationStatus.CANCELLED);
                    allocationRepository.save(a);
                });

        member.setStatus(ProjectTeamMemberStatus.REMOVED);
        teamMemberRepository.save(member);

        String memberDesc = member.getEmployee().getFirstName() + " " + member.getEmployee().getLastName();
        historyHelper.recordAction(tp, TechnicalProjectHistoryAction.TEAM_MEMBER_REMOVED,
                memberDesc + " removed", null, null, actor != null ? actor.getId() : null);

        return buildTeamDetailDTO(projectTeamRepository.findByIdWithDetails(teamId).orElseThrow());
    }

    // ========================================================================================
    // Mark team ready
    // ========================================================================================

    /**
     * Mark a team as READY. Requires at least one active member.
     * Updates department formation status to COMPLETED.
     * If all departments of the project are COMPLETED, sets project to TEAM_READY,
     * otherwise TEAM_FORMATION_IN_PROGRESS.
     */
    public ProjectTeamDetailDTO markTeamReady(UUID teamId) {
        ProjectTeam team = projectTeamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Project team not found"));

        TechnicalProjectDepartment tpd = team.getTechnicalProjectDepartment();
        validateDepartmentAccess(tpd.getDepartment().getId());

        if (team.getStatus() == ProjectTeamStatus.READY) {
            throw new ResourceConflictException("Team is already READY");
        }

        long activeMembers = teamMemberRepository.countByProjectTeamIdAndStatus(teamId, ProjectTeamMemberStatus.ACTIVE);
        if (activeMembers == 0) {
            throw new ResourceConflictException("Team must have at least one active member before it can be marked READY");
        }

        User actor = getAuthenticatedUser();
        TechnicalProject tp = tpd.getTechnicalProject();

        validateProjectNotClosed(tp);

        team.setStatus(ProjectTeamStatus.READY);
        projectTeamRepository.save(team);

        tpd.setFormationStatus(TeamFormationStatus.COMPLETED);
        tpd.setSubmittedBy(actor);
        tpd.setSubmittedAt(OffsetDateTime.now());
        departmentAssignmentRepository.save(tpd);

        // Check if all departments are COMPLETED
        long totalDepts = departmentAssignmentRepository.countByTechnicalProjectId(tp.getId());
        long completedDepts = departmentAssignmentRepository.countByTechnicalProjectIdAndFormationStatus(
                tp.getId(), TeamFormationStatus.COMPLETED);

        if (totalDepts > 0 && completedDepts == totalDepts) {
            tp.setStatus(TechnicalProjectStatus.TEAM_READY);
        } else {
            tp.setStatus(TechnicalProjectStatus.TEAM_FORMATION_IN_PROGRESS);
        }
        technicalProjectRepository.save(tp);

        historyHelper.recordAction(tp, TechnicalProjectHistoryAction.TEAM_MARKED_READY,
                null, "Team marked READY for department: " + tpd.getDepartment().getName(),
                null, actor != null ? actor.getId() : null);

        return buildTeamDetailDTO(projectTeamRepository.findByIdWithDetails(teamId).orElseThrow());
    }

    // ========================================================================================
    // Conflict validation
    // ========================================================================================

    /**
     * Checks leave overlap, allocation overlap, and capacity.
     * Returns true if an override was granted, false if no override was needed.
     * Throws ResourceConflictException if a conflict exists and override is not permitted.
     *
     * @param excludeAllocationId if updating, the allocation ID to exclude from overlap count
     */
    private boolean performConflictChecks(Employee employee,
                                          LocalDate startDate,
                                          LocalDate endDate,
                                          BigDecimal requestedHours,
                                          UUID excludeAllocationId,
                                          boolean overrideRequested,
                                          String overrideReason) {
        // 1. Leave conflict
        boolean hasLeave = leaveRepository.existsOverlappingLeave(
                employee.getId(), startDate, endDate, LeaveStatus.APPROVED);
        if (hasLeave && !overrideRequested) {
            throw new ResourceConflictException(
                    "Employee " + employee.getEmployeeNumber() + " has approved leave overlapping the requested period. " +
                    "Use overrideRequested=true with a valid overrideReason to proceed.");
        }

        // 2. Active allocation overlap (from other projects/teams, or same team different member)
        List<EmployeeAllocation> overlapping = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), startDate, endDate, EmployeeAllocationStatus.ACTIVE);

        // If updating, exclude the member's existing allocation
        if (excludeAllocationId != null) {
            overlapping = overlapping.stream()
                    .filter(a -> !a.getId().equals(excludeAllocationId))
                    .collect(Collectors.toList());
        }

        if (!overlapping.isEmpty() && !overrideRequested) {
            throw new ResourceConflictException(
                    "Employee " + employee.getEmployeeNumber() + " has overlapping active allocations. " +
                    "Use overrideRequested=true with a valid overrideReason to proceed.");
        }

        // 3. Capacity check
        long workingDays = calculateWorkingDays(startDate, endDate);
        BigDecimal dailyCap = employee.getWeeklyCapacityHours().divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);
        BigDecimal totalCapacity = dailyCap.multiply(BigDecimal.valueOf(workingDays));
        
        BigDecimal existingHours = overlapping.stream()
                .map(EmployeeAllocation::getAssignedHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal newTotal = existingHours.add(requestedHours);
        if (newTotal.compareTo(totalCapacity) > 0 && !overrideRequested) {
            throw new ResourceConflictException(
                    "Requested hours (" + requestedHours + ") would exceed capacity (" + totalCapacity + ") for employee " +
                    employee.getEmployeeNumber() + ". Use overrideRequested=true with a valid overrideReason to proceed.");
        }

        // If override was requested, verify permission and non-blank reason
        boolean needsOverride = hasLeave || !overlapping.isEmpty() || newTotal.compareTo(totalCapacity) > 0;
        if (needsOverride && overrideRequested) {
            if (!hasAuthority("EMPLOYEE_ALLOCATION_OVERRIDE")) {
                throw new AccessDeniedException("You do not have permission to override allocation conflicts (EMPLOYEE_ALLOCATION_OVERRIDE required)");
            }
            if (overrideReason == null || overrideReason.isBlank()) {
                throw new IllegalArgumentException("overrideReason must be provided and non-blank when overrideRequested=true");
            }
            return true;
        }
        return false;
    }


    // ========================================================================================
    // DTO builder
    // ========================================================================================

    private ProjectTeamDetailDTO buildTeamDetailDTO(ProjectTeam team) {
        TechnicalProjectDepartment tpd = team.getTechnicalProjectDepartment();
        TechnicalProject tp = tpd.getTechnicalProject();

        ProjectTeamDetailDTO dto = new ProjectTeamDetailDTO();
        dto.setId(team.getId());
        dto.setTechnicalProjectDepartmentId(tpd.getId());
        dto.setTechnicalProjectId(tp.getId());
        dto.setDepartmentId(tpd.getDepartment().getId());
        dto.setProjectCode(tp.getProjectCode());
        dto.setProjectTitle(tp.getProjectBrief() != null ? tp.getProjectBrief().getProjectTitle() : "Unknown");
        dto.setClientName(tp.getSalesOpportunity() != null && tp.getSalesOpportunity().getClient() != null ? tp.getSalesOpportunity().getClient().getName() : "Unknown");
        dto.setDepartmentName(tpd.getDepartment().getName());
        dto.setTeamName(team.getTeamName());
        dto.setStatus(team.getStatus());
        dto.setFormationStatus(tpd.getFormationStatus());
        dto.setRequiredScope(tpd.getRequiredScope());
        dto.setExpectedStartDate(null);
        dto.setExpectedDeliveryDate(tp.getProjectBrief() != null ? tp.getProjectBrief().getExpectedDeadline() : null);
        dto.setProjectClosed(isProjectClosed(tp));

        dto.setExpectedEstimateSubmissionDate(tpd.getExpectedEstimateSubmissionDate());
        dto.setCreatedAt(team.getCreatedAt());
        dto.setUpdatedAt(team.getUpdatedAt());
        dto.setVersion(team.getVersion());

        List<ProjectTeamMember> members = teamMemberRepository.findByProjectTeamIdAndStatus(
                team.getId(), ProjectTeamMemberStatus.ACTIVE);

        List<ProjectTeamMemberDTO> memberDTOs = members.stream().map(m -> {

            ProjectTeamMemberDTO mdto = new ProjectTeamMemberDTO();
            mdto.setId(m.getId());
            mdto.setEmployeeId(m.getEmployee().getId());
            mdto.setEmployeeNumber(m.getEmployee().getEmployeeNumber());
            mdto.setEmployeeName(m.getEmployee().getFirstName() + " " + m.getEmployee().getLastName());
            mdto.setJobTitle(m.getEmployee().getJobTitle());
            mdto.setProjectRole(m.getProjectRole());
            mdto.setAllocationStartDate(m.getAllocationStartDate());
            mdto.setAllocationEndDate(m.getAllocationEndDate());
            mdto.setAssignedHours(m.getAssignedHours());
            mdto.setPrimaryMember(m.isPrimaryMember());
            mdto.setStatus(m.getStatus());
            mdto.setAddedAt(m.getAddedAt());

            // Find linked active allocation for this member
            if (m.getStatus() == ProjectTeamMemberStatus.ACTIVE) {
                allocationRepository.findByProjectTeamIdAndStatus(team.getId(), EmployeeAllocationStatus.ACTIVE)
                        .stream()
                        .filter(a -> a.getEmployee().getId().equals(m.getEmployee().getId()))
                        .findFirst()
                        .ifPresent(a -> {
                            mdto.setAllocationId(a.getId());
                            mdto.setOverrideFlag(a.isOverrideFlag());
                            mdto.setOverrideReason(a.getOverrideReason());
                        });
            }
            return mdto;
        }).collect(Collectors.toList());

        dto.setMembers(memberDTOs);
        return dto;
    }

    // ========================================================================================
    // Helpers
    // ========================================================================================

    private void validateDates(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("allocationStartDate and allocationEndDate are required");
        }
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("allocationStartDate cannot be after allocationEndDate");
        }
    }

    private void validatePositiveHours(BigDecimal hours) {
        if (hours == null || hours.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("assignedHours must be positive");
        }
    }

    private long calculateWorkingDays(LocalDate start, LocalDate end) {
        long days = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY && current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                days++;
            }
            current = current.plus(1, ChronoUnit.DAYS);
        }
        return days;
    }
}
