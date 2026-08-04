package com.knoweb.salesmanagement.technicalproject.service;

import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.entity.ClientVerification;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.approval.repository.ClientVerificationRepository;
import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.dto.*;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProjectDepartment;
import com.knoweb.salesmanagement.technicalproject.enums.TeamFormationStatus;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectHistoryAction;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.technicalproject.repository.ProjectTeamRepository;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectDepartmentRepository;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TechnicalRoutingService {

    private final TechnicalProjectRepository technicalProjectRepository;
    private final ProjectBriefRepository projectBriefRepository;
    private final TechnicalProjectDepartmentRepository departmentAssignmentRepository;
    private final DepartmentRepository departmentRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final TechnicalProjectHistoryHelper historyHelper;
    private final UserRepository userRepository;
    private final BdmApprovalRepository bdmApprovalRepository;
    private final ClientVerificationRepository clientVerificationRepository;

    public TechnicalRoutingService(TechnicalProjectRepository technicalProjectRepository,
                                   ProjectBriefRepository projectBriefRepository,
                                   TechnicalProjectDepartmentRepository departmentAssignmentRepository,
                                   DepartmentRepository departmentRepository,
                                   ProjectTeamRepository projectTeamRepository,
                                   TechnicalProjectHistoryHelper historyHelper,
                                   UserRepository userRepository,
                                   BdmApprovalRepository bdmApprovalRepository,
                                   ClientVerificationRepository clientVerificationRepository) {
        this.technicalProjectRepository = technicalProjectRepository;
        this.projectBriefRepository = projectBriefRepository;
        this.departmentAssignmentRepository = departmentAssignmentRepository;
        this.departmentRepository = departmentRepository;
        this.projectTeamRepository = projectTeamRepository;
        this.historyHelper = historyHelper;
        this.userRepository = userRepository;
        this.bdmApprovalRepository = bdmApprovalRepository;
        this.clientVerificationRepository = clientVerificationRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @Transactional(readOnly = true)
    public Page<EligibleProjectBriefSummaryDTO> getEligibleProjectBriefs(Pageable pageable) {
        Page<ProjectBrief> eligibleBriefs = projectBriefRepository.findEligibleForTechnicalRouting(
            List.of(
                com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus.DRAFT,
                com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus.SUBMITTED,
                com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus.BDM_RETURNED_FOR_REVISION,
                com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus.BDM_INFORMATION_REQUESTED,
                com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus.BDM_REJECTED,
                com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus.CLIENT_CHANGES_REQUESTED,
                com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus.CLIENT_REJECTED
            ),
            ClientVerificationStatus.CONFIRMED,
            BdmApprovalStatus.APPROVED,
            pageable
        );

        return eligibleBriefs.map(pb -> {
            var opp = pb.getOpportunity();
            var client = opp != null ? opp.getClient() : null;
            
            OffsetDateTime bdmDate = bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(
                pb.getId(), pb.getCurrentVersionNumber(), BdmApprovalStatus.APPROVED)
                .map(BdmApproval::getDecisionDate).orElse(null);

            String suggested = pb.getRequiredDepartments().stream()
                .map(Department::getName)
                .collect(Collectors.joining(", "));

            return new EligibleProjectBriefSummaryDTO(
                pb.getId(),
                pb.getProjectTitle(),
                client != null ? client.getId() : null,
                client != null ? client.getName() : null,
                opp != null ? opp.getId() : null,
                opp != null ? opp.getOpportunityNumber() : null,
                bdmDate,
                suggested
            );
        });
    }

    @Transactional(readOnly = true)
    public Page<TechnicalProjectSummaryDTO> getTechnicalProjectsQueue(String search, TechnicalProjectStatus status, Pageable pageable) {
        if (search != null && search.trim().isEmpty()) {
            search = null;
        }
        Page<TechnicalProject> projects = technicalProjectRepository.searchProjects(search, status, pageable);
        
        return projects.map(tp -> {
            var pb = tp.getProjectBrief();
            var opp = tp.getSalesOpportunity();
            var client = opp != null ? opp.getClient() : null;
            
            OffsetDateTime bdmDate = null;
            if (pb != null) {
                bdmDate = bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(
                    pb.getId(), pb.getCurrentVersionNumber(), BdmApprovalStatus.APPROVED)
                    .map(BdmApproval::getDecisionDate).orElse(null);
            }

            long deptCount = departmentAssignmentRepository.countByTechnicalProjectId(tp.getId());
            long teamReadyCount = departmentAssignmentRepository.countByTechnicalProjectIdAndFormationStatus(tp.getId(), TeamFormationStatus.COMPLETED);
            
            String routedDepts = departmentAssignmentRepository.findByTechnicalProjectId(tp.getId())
                .stream().map(d -> d.getDepartment().getName()).collect(Collectors.joining(", "));
                
            String suggestedDepts = pb != null ? pb.getRequiredDepartments().stream().map(Department::getName).collect(Collectors.joining(", ")) : "";

            String tcName = null;
            User tc = tp.getTechnicalCoordinator();
            if (tc != null) {
                tcName = tc.getFirstName() + " " + tc.getLastName();
            }

            return new TechnicalProjectSummaryDTO(
                tp.getId(),
                tp.getProjectCode(),
                tp.getStatus(),
                pb != null ? pb.getId() : null,
                pb != null ? pb.getProjectTitle() : null,
                client != null ? client.getId() : null,
                client != null ? client.getName() : null,
                opp != null ? opp.getId() : null,
                opp != null ? opp.getOpportunityNumber() : null,
                tc != null ? tc.getId() : null,
                tcName,
                bdmDate,
                tp.getRoutedAt(),
                tp.getCreatedAt(),
                deptCount,
                teamReadyCount,
                suggestedDepts,
                routedDepts
            );
        });
    }

    @Transactional(readOnly = true)
    public TechnicalProjectDetailDTO getTechnicalProjectDetail(UUID projectId) {
        TechnicalProject tp = technicalProjectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Technical project not found"));

        TechnicalProjectDetailDTO dto = new TechnicalProjectDetailDTO();
        dto.setId(tp.getId());
        dto.setProjectCode(tp.getProjectCode());
        dto.setStatus(tp.getStatus());
        
        User tc = tp.getTechnicalCoordinator();
        if (tc != null) {
            dto.setTechnicalCoordinatorId(tc.getId());
            dto.setTechnicalCoordinatorName(tc.getFirstName() + " " + tc.getLastName());
        }
        
        dto.setCreatedAt(tp.getCreatedAt());
        dto.setRoutedAt(tp.getRoutedAt());
        dto.setVersion(tp.getVersion());

        var opp = tp.getSalesOpportunity();
        if (opp != null) {
            dto.setSalesOpportunityId(opp.getId());
            dto.setOpportunityReference(opp.getOpportunityNumber());
            dto.setOpportunityTitle(opp.getTitle());
            dto.setOpportunityStage(opp.getStage());

            var client = opp.getClient();
            if (client != null) {
                dto.setClientId(client.getId());
                dto.setClientName(client.getName());
                
                var primaryContact = opp.getPrimaryContact();
                if (primaryContact != null) {
                    dto.setPrimaryContactSummary(primaryContact.getFirstName() + " " + primaryContact.getLastName() + " (" + primaryContact.getEmail() + ")");
                }
            }
        }

        var pb = tp.getProjectBrief();
        if (pb != null) {
            dto.setProjectBriefId(pb.getId());
            dto.setCurrentVersionNumber(pb.getCurrentVersionNumber());
            dto.setProjectTitle(pb.getProjectTitle());
            dto.setProjectScope(pb.getProjectScope());
            dto.setTechnicalRequirements(pb.getTechnicalRequirements());
            dto.setExpectedBudget(pb.getExpectedBudget());
            dto.setCurrency(pb.getCurrency());
            dto.setExpectedDeadline(pb.getExpectedDeadline());
            dto.setSiteDetails(pb.getSiteName() + " - " + pb.getSiteAddress());
            
            String suggestedDepts = pb.getRequiredDepartments().stream().map(Department::getName).collect(Collectors.joining(", "));
            dto.setSuggestedDepartments(suggestedDepts);
            dto.setProjectBriefStatus(pb.getStatus());

            Phase6ApprovalSummaryDTO approvalDto = new Phase6ApprovalSummaryDTO();
            
            clientVerificationRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(pb.getId(), pb.getCurrentVersionNumber(), ClientVerificationStatus.CONFIRMED)
                .ifPresent(cv -> {
                    approvalDto.setClientVerificationId(cv.getId());
                    approvalDto.setClientVerificationStatus(cv.getStatus());
                    approvalDto.setVerifiedDate(cv.getDecisionDate());
                    approvalDto.setVerifiedBy(cv.getVerifierName());
                });

            bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(pb.getId(), pb.getCurrentVersionNumber(), BdmApprovalStatus.APPROVED)
                .ifPresent(ba -> {
                    approvalDto.setBdmApprovalId(ba.getId());
                    approvalDto.setBdmApprovalStatus(ba.getStatus());
                    approvalDto.setApprovedDate(ba.getDecisionDate());
                    approvalDto.setApprovalComments(null); // Explicitly null as per constraints
                    User approvedBy = ba.getDecisionMaker();
                    if (approvedBy != null) {
                        approvalDto.setApprovedBy(approvedBy.getFirstName() + " " + approvedBy.getLastName());
                    }
                });
                
            dto.setApprovalSummary(approvalDto);
        }

        List<TechnicalProjectDepartment> depts = departmentAssignmentRepository.findByTechnicalProjectId(projectId);
        List<TechnicalProjectDepartmentDTO> routedDepts = depts.stream().map(d -> {
            TechnicalProjectDepartmentDTO dDto = new TechnicalProjectDepartmentDTO(
                d.getId(),
                d.getDepartment().getId(),
                d.getDepartment().getName(),
                d.getDepartment().getCode(),
                d.getRequiredScope(),
                d.getExpectedEstimateSubmissionDate(),
                d.getRoutingNotes(),
                d.getFormationStatus(),
                d.getAssignedBy() != null ? d.getAssignedBy().getId() : null,
                null,
                d.getAssignedAt()
            );
            if (d.getAssignedBy() != null) {
                dDto.setAssignedByName(d.getAssignedBy().getFirstName() + " " + d.getAssignedBy().getLastName());
            }
            return dDto;
        }).collect(Collectors.toList());
        
        dto.setRoutedDepartments(routedDepts);

        return dto;
    }

    @Transactional
    public void routeProject(UUID projectId, TechnicalRoutingRequest request) {
        TechnicalProject tp = technicalProjectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Technical project not found"));

        if (tp.getStatus() != TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING) {
            throw new ResourceConflictException("Project is not awaiting technical routing. Current status: " + tp.getStatus());
        }

        User actingUser = getAuthenticatedUser();
        UUID actingUserId = actingUser != null ? actingUser.getId() : null;

        Set<UUID> uniqueDeptIds = new HashSet<>();
        for (TechnicalRoutingDepartmentRequest deptReq : request.getDepartments()) {
            if (!uniqueDeptIds.add(deptReq.getDepartmentId())) {
                throw new ResourceConflictException("Duplicate department ID in request: " + deptReq.getDepartmentId());
            }
        }

        for (TechnicalRoutingDepartmentRequest deptReq : request.getDepartments()) {
            if (departmentAssignmentRepository.existsByTechnicalProjectIdAndDepartmentId(tp.getId(), deptReq.getDepartmentId())) {
                throw new ResourceConflictException("Department is already assigned to this project: " + deptReq.getDepartmentId());
            }

            Department dept = departmentRepository.findById(deptReq.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + deptReq.getDepartmentId()));

            if (!dept.isActive()) {
                throw new ResourceConflictException("Department is not active: " + dept.getName());
            }

            TechnicalProjectDepartment assignment = new TechnicalProjectDepartment();
            assignment.setTechnicalProject(tp);
            assignment.setDepartment(dept);
            assignment.setRequiredScope(deptReq.getRequiredScope());
            assignment.setExpectedEstimateSubmissionDate(deptReq.getExpectedEstimateSubmissionDate());
            assignment.setRoutingNotes(deptReq.getRoutingNotes());
            assignment.setFormationStatus(TeamFormationStatus.PENDING);
            assignment.setAssignedBy(actingUser);
            assignment.setAssignedAt(OffsetDateTime.now());

            try {
                assignment = departmentAssignmentRepository.save(assignment);
                historyHelper.recordAction(tp, TechnicalProjectHistoryAction.DEPARTMENT_ROUTED, 
                    null, "Routed to department: " + dept.getName(), null, actingUserId);
            } catch (DataIntegrityViolationException e) {
                throw new ResourceConflictException("Duplicate routing assignment detected.");
            }
        }

        tp.setStatus(TechnicalProjectStatus.ROUTED);
        tp.setRoutedAt(OffsetDateTime.now());
        
        try {
            technicalProjectRepository.save(tp);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ResourceConflictException("Optimistic lock conflict: project was modified by another user.");
        }
    }

    @Transactional
    public void reviseRouting(UUID projectId, TechnicalRoutingRevisionRequest request) {
        TechnicalProject tp = technicalProjectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Technical project not found"));

        if (tp.getStatus() == TechnicalProjectStatus.TEAM_READY) {
            throw new ResourceConflictException("Cannot revise routing: project team is already marked as TEAM_READY.");
        }

        if (!tp.getVersion().equals(request.getOptimisticLockVersion())) {
            throw new ResourceConflictException("Optimistic lock conflict: project version mismatch.");
        }

        User actingUser = getAuthenticatedUser();
        UUID actingUserId = actingUser != null ? actingUser.getId() : null;

        Set<UUID> uniqueDeptIds = new HashSet<>();
        for (TechnicalRoutingDepartmentRequest deptReq : request.getDepartments()) {
            if (!uniqueDeptIds.add(deptReq.getDepartmentId())) {
                throw new ResourceConflictException("Duplicate department ID in request: " + deptReq.getDepartmentId());
            }
        }

        List<TechnicalProjectDepartment> existingAssignments = departmentAssignmentRepository.findByTechnicalProjectId(projectId);
        Map<UUID, TechnicalProjectDepartment> existingMap = existingAssignments.stream()
            .collect(Collectors.toMap(a -> a.getDepartment().getId(), a -> a));

        for (TechnicalRoutingDepartmentRequest deptReq : request.getDepartments()) {
            TechnicalProjectDepartment existing = existingMap.get(deptReq.getDepartmentId());
            if (existing != null) {
                if (projectTeamRepository.existsByTechnicalProjectDepartmentId(existing.getId())) {
                    if (hasChangedProtectedFields(existing, deptReq)) {
                         throw new ResourceConflictException("Team formation has started for department " + existing.getDepartment().getName() + ". Cannot modify critical routing info.");
                    }
                }
                existing.setRequiredScope(deptReq.getRequiredScope());
                existing.setExpectedEstimateSubmissionDate(deptReq.getExpectedEstimateSubmissionDate());
                existing.setRoutingNotes(deptReq.getRoutingNotes());
                departmentAssignmentRepository.save(existing);
            } else {
                Department dept = departmentRepository.findById(deptReq.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + deptReq.getDepartmentId()));

                if (!dept.isActive()) {
                    throw new ResourceConflictException("Department is not active: " + dept.getName());
                }

                TechnicalProjectDepartment assignment = new TechnicalProjectDepartment();
                assignment.setTechnicalProject(tp);
                assignment.setDepartment(dept);
                assignment.setRequiredScope(deptReq.getRequiredScope());
                assignment.setExpectedEstimateSubmissionDate(deptReq.getExpectedEstimateSubmissionDate());
                assignment.setRoutingNotes(deptReq.getRoutingNotes());
                assignment.setFormationStatus(TeamFormationStatus.PENDING);
                assignment.setAssignedBy(actingUser);
                assignment.setAssignedAt(OffsetDateTime.now());

                try {
                    departmentAssignmentRepository.save(assignment);
                    historyHelper.recordAction(tp, TechnicalProjectHistoryAction.DEPARTMENT_ROUTED, 
                        null, "Routed to department: " + dept.getName(), request.getRevisionReason(), actingUserId);
                } catch (DataIntegrityViolationException e) {
                    throw new ResourceConflictException("Duplicate routing assignment detected.");
                }
            }
        }

        for (TechnicalProjectDepartment existing : existingAssignments) {
            if (!uniqueDeptIds.contains(existing.getDepartment().getId())) {
                if (projectTeamRepository.existsByTechnicalProjectDepartmentId(existing.getId())) {
                    throw new ResourceConflictException("Cannot remove department " + existing.getDepartment().getName() + " because team formation has already begun.");
                }
                departmentAssignmentRepository.delete(existing);
                historyHelper.recordAction(tp, TechnicalProjectHistoryAction.ROUTING_REVISED, 
                    "Removed department: " + existing.getDepartment().getName(), null, request.getRevisionReason(), actingUserId);
            }
        }
        
        historyHelper.recordAction(tp, TechnicalProjectHistoryAction.ROUTING_REVISED, 
                    null, "Routing revised completely", request.getRevisionReason(), actingUserId);

        tp.setRoutedAt(OffsetDateTime.now());
        
        try {
            technicalProjectRepository.save(tp);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ResourceConflictException("Optimistic lock conflict: project was modified by another user.");
        }
    }
    
    private boolean hasChangedProtectedFields(TechnicalProjectDepartment existing, TechnicalRoutingDepartmentRequest req) {
        return !existing.getRequiredScope().equals(req.getRequiredScope()) ||
               !existing.getExpectedEstimateSubmissionDate().equals(req.getExpectedEstimateSubmissionDate());
    }
}
