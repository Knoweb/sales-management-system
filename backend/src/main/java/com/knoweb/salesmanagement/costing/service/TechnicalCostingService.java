package com.knoweb.salesmanagement.costing.service;

import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.costing.dto.*;
import com.knoweb.salesmanagement.costing.entity.*;
import com.knoweb.salesmanagement.costing.enums.*;
import com.knoweb.salesmanagement.costing.repository.*;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.entity.DepartmentHead;
import com.knoweb.salesmanagement.department.repository.DepartmentHeadRepository;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.technicalproject.entity.EmployeeAllocation;
import com.knoweb.salesmanagement.technicalproject.entity.ProjectTeamMember;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProjectDepartment;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.technicalproject.repository.EmployeeAllocationRepository;
import com.knoweb.salesmanagement.technicalproject.repository.ProjectTeamMemberRepository;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectDepartmentRepository;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TechnicalCostingService {

    private final DepartmentTechnicalEstimateRepository departmentEstimateRepository;
    private final DepartmentEstimateLineItemRepository lineItemRepository;
    private final ConsolidatedTechnicalEstimateRepository consolidatedRepository;
    private final TechnicalProjectRepository technicalProjectRepository;
    private final TechnicalProjectDepartmentRepository technicalProjectDepartmentRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentHeadRepository departmentHeadRepository;
    private final EmployeeAllocationRepository employeeAllocationRepository;
    private final ProjectTeamMemberRepository projectTeamMemberRepository;

    public TechnicalCostingService(DepartmentTechnicalEstimateRepository departmentEstimateRepository,
                                   DepartmentEstimateLineItemRepository lineItemRepository,
                                   ConsolidatedTechnicalEstimateRepository consolidatedRepository,
                                   TechnicalProjectRepository technicalProjectRepository,
                                   TechnicalProjectDepartmentRepository technicalProjectDepartmentRepository,
                                   DepartmentRepository departmentRepository,
                                   UserRepository userRepository,
                                   EmployeeRepository employeeRepository,
                                   DepartmentHeadRepository departmentHeadRepository,
                                   EmployeeAllocationRepository employeeAllocationRepository,
                                   ProjectTeamMemberRepository projectTeamMemberRepository) {
        this.departmentEstimateRepository = departmentEstimateRepository;
        this.lineItemRepository = lineItemRepository;
        this.consolidatedRepository = consolidatedRepository;
        this.technicalProjectRepository = technicalProjectRepository;
        this.technicalProjectDepartmentRepository = technicalProjectDepartmentRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.departmentHeadRepository = departmentHeadRepository;
        this.employeeAllocationRepository = employeeAllocationRepository;
        this.projectTeamMemberRepository = projectTeamMemberRepository;
    }

    // ========================================================================================
    // Null-safe domain resolution helpers
    // ========================================================================================

    /** Resolves a human-readable title from a TechnicalProject via its linked ProjectBrief. */
    private String resolveProjectTitle(TechnicalProject project) {
        if (project == null) return null;
        if (project.getProjectBrief() != null && project.getProjectBrief().getProjectTitle() != null) {
            return project.getProjectBrief().getProjectTitle();
        }
        return project.getProjectCode();
    }

    /** Builds a display name from a User's firstName + lastName fields. */
    private String resolveUserDisplayName(User user) {
        if (user == null) return null;
        String first = user.getFirstName() != null ? user.getFirstName() : "";
        String last  = user.getLastName()  != null ? user.getLastName()  : "";
        return (first + " " + last).trim();
    }

    /** Builds a display name from an Employee's firstName + lastName fields. */
    private String resolveEmployeeDisplayName(Employee employee) {
        if (employee == null) return null;
        String first = employee.getFirstName() != null ? employee.getFirstName() : "";
        String last  = employee.getLastName()  != null ? employee.getLastName()  : "";
        return (first + " " + last).trim();
    }

    /**
     * Resolves the project role name for an EmployeeAllocation.
     * The role is stored on the ProjectTeamMember linked to the same team and employee.
     * Falls back to the employee's job title if no team member record is found.
     */
    private String resolveAllocationProjectRole(EmployeeAllocation allocation) {
        if (allocation == null) return null;
        if (allocation.getProjectTeam() != null && allocation.getEmployee() != null) {
            return projectTeamMemberRepository
                    .findAllByProjectTeamId(allocation.getProjectTeam().getId())
                    .stream()
                    .filter(m -> m.getEmployee() != null
                              && m.getEmployee().getId().equals(allocation.getEmployee().getId()))
                    .findFirst()
                    .map(m -> m.getProjectRole() != null ? m.getProjectRole().name() : null)
                    .orElseGet(() -> allocation.getEmployee().getJobTitle());
        }
        return allocation.getEmployee() != null ? allocation.getEmployee().getJobTitle() : null;
    }

    // ========================================================================================
    // Security & Authorization helpers
    // ========================================================================================

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private boolean hasAuthority(String authority) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(authority) || a.equals("ROLE_" + authority));
    }

    private Optional<DepartmentHead> getActiveHeadshipForCurrentUser() {
        User user = getAuthenticatedUser();
        if (user == null) return Optional.empty();
        Optional<Employee> emp = employeeRepository.findByUserId(user.getId());
        if (emp.isEmpty()) return Optional.empty();
        return departmentHeadRepository.findByEmployeeIdAndActiveTrue(emp.get().getId());
    }

    private void validateDepartmentAccess(UUID departmentId, boolean writeAction) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new AccessDeniedException("Not authenticated");
        }
        boolean isSystemAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ROLE_SYSTEM_ADMIN") || r.equals("SYSTEM_ADMIN"));
        if (isSystemAdmin) {
            return;
        }

        boolean isTC = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ROLE_TECHNICAL_COORDINATOR") || r.equals("TECHNICAL_COORDINATOR"));

        if (isTC) {
            if (writeAction) {
                throw new AccessDeniedException("Technical Coordinator cannot create or edit department estimates directly.");
            }
            return;
        }

        boolean isHod = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals("ROLE_HOD") || r.equals("HOD"));

        if (isHod) {
            Optional<DepartmentHead> head = getActiveHeadshipForCurrentUser();
            if (head.isPresent() && head.get().getDepartment().getId().equals(departmentId)) {
                return;
            }
            throw new AccessDeniedException("You are not authorised to access estimates for department " + departmentId);
        }

        if (writeAction) {
            throw new AccessDeniedException("You are not authorised to create or edit department estimates.");
        }

        boolean hasReadPermission = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("TECHNICAL_ESTIMATE_READ") || a.equals("ROLE_TECHNICAL_ESTIMATE_READ"));
        if (!hasReadPermission) {
            throw new AccessDeniedException("You are not authorised to view estimates for department " + departmentId);
        }
    }

    private void validateCoordinatorOrAdmin() {
        if (!hasAuthority("SYSTEM_ADMIN") && !hasAuthority("TECHNICAL_COORDINATOR") && !hasAuthority("TECHNICAL_ESTIMATE_REVIEW")) {
            throw new AccessDeniedException("Only Technical Coordinator or System Admin can perform this action.");
        }
    }

    // ========================================================================================
    // Department Estimate Methods
    // ========================================================================================

    @Transactional
    public DepartmentEstimateDTO getDepartmentEstimate(UUID technicalProjectId, UUID departmentId) {
        validateDepartmentAccess(departmentId, false);

        TechnicalProject project = technicalProjectRepository.findById(technicalProjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Technical project not found: " + technicalProjectId));

        Optional<DepartmentTechnicalEstimate> latestOpt = departmentEstimateRepository
                .findFirstByTechnicalProjectIdAndDepartmentIdOrderByVersionNumberDesc(technicalProjectId, departmentId);

        if (latestOpt.isPresent()) {
            return mapToDepartmentDTO(latestOpt.get());
        }

        // If no estimate exists yet, check if project is TEAM_READY and create version 1 DRAFT if write user
        if (project.getStatus() != TechnicalProjectStatus.TEAM_READY) {
            throw new ResourceConflictException("Project must be in TEAM_READY status to enter costing.");
        }

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + departmentId));

        DepartmentTechnicalEstimate estimate = new DepartmentTechnicalEstimate();
        estimate.setTechnicalProject(project);
        estimate.setDepartment(department);
        estimate.setVersionNumber(1);
        estimate.setStatus(DepartmentEstimateStatus.DRAFT);
        estimate.setCreatedBy(getAuthenticatedUser());
        departmentEstimateRepository.save(estimate);

        return mapToDepartmentDTO(estimate);
    }

    @Transactional
    public DepartmentEstimateDTO saveDepartmentEstimate(UUID technicalProjectId, UUID departmentId, DepartmentEstimateSaveRequest request) {
        validateDepartmentAccess(departmentId, true);

        TechnicalProject project = technicalProjectRepository.findById(technicalProjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Technical project not found: " + technicalProjectId));

        if (project.getStatus() != TechnicalProjectStatus.TEAM_READY) {
            throw new ResourceConflictException("Project must be in TEAM_READY status to edit costing.");
        }

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + departmentId));

        Optional<DepartmentTechnicalEstimate> latestOpt = departmentEstimateRepository
                .findFirstByTechnicalProjectIdAndDepartmentIdOrderByVersionNumberDesc(technicalProjectId, departmentId);

        DepartmentTechnicalEstimate estimate;
        if (latestOpt.isPresent()) {
            DepartmentTechnicalEstimate latest = latestOpt.get();
            if (latest.getStatus() == DepartmentEstimateStatus.SUBMITTED || latest.getStatus() == DepartmentEstimateStatus.APPROVED) {
                throw new ResourceConflictException("Estimate has already been submitted or approved and is read-only.");
            } else if (latest.getStatus() == DepartmentEstimateStatus.REVISION_REQUESTED) {
                // Create new version in DRAFT state, preserving previous version
                estimate = new DepartmentTechnicalEstimate();
                estimate.setTechnicalProject(project);
                estimate.setDepartment(department);
                estimate.setVersionNumber(latest.getVersionNumber() + 1);
                estimate.setStatus(DepartmentEstimateStatus.DRAFT);
                estimate.setCreatedBy(getAuthenticatedUser());
            } else {
                estimate = latest;
            }
        } else {
            estimate = new DepartmentTechnicalEstimate();
            estimate.setTechnicalProject(project);
            estimate.setDepartment(department);
            estimate.setVersionNumber(1);
            estimate.setStatus(DepartmentEstimateStatus.DRAFT);
            estimate.setCreatedBy(getAuthenticatedUser());
        }

        estimate.setContingencyPercentage(request.getContingencyPercentage() != null ? request.getContingencyPercentage() : BigDecimal.ZERO);
        estimate.setTaxPercentage(request.getTaxPercentage() != null ? request.getTaxPercentage() : BigDecimal.ZERO);
        estimate.setMarginPercentage(request.getMarginPercentage() != null ? request.getMarginPercentage() : BigDecimal.ZERO);

        estimate.setDesignDurationDays(request.getDesignDurationDays() != null ? request.getDesignDurationDays() : 0);
        estimate.setProcurementDurationDays(request.getProcurementDurationDays() != null ? request.getProcurementDurationDays() : 0);
        estimate.setDevelopmentDurationDays(request.getDevelopmentDurationDays() != null ? request.getDevelopmentDurationDays() : 0);
        estimate.setTestingDurationDays(request.getTestingDurationDays() != null ? request.getTestingDurationDays() : 0);
        estimate.setInstallationDurationDays(request.getInstallationDurationDays() != null ? request.getInstallationDurationDays() : 0);
        estimate.setTrainingDurationDays(request.getTrainingDurationDays() != null ? request.getTrainingDurationDays() : 0);
        estimate.setDeliveryDurationDays(request.getDeliveryDurationDays() != null ? request.getDeliveryDurationDays() : 0);

        // Rebuild line items
        estimate.getLineItems().clear();
        for (DepartmentEstimateLineItemRequest itemReq : request.getLineItems()) {
            DepartmentEstimateLineItem item = new DepartmentEstimateLineItem();
            item.setCategory(itemReq.getCategory());
            item.setDescription(itemReq.getDescription());
            item.setQuantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ONE);
            item.setUnitOfMeasure(itemReq.getUnitOfMeasure());
            item.setUnitCost(itemReq.getUnitCost() != null ? itemReq.getUnitCost() : BigDecimal.ZERO);
            item.setTotalCost(item.getQuantity().multiply(item.getUnitCost()).setScale(2, RoundingMode.HALF_UP));
            item.setNotes(itemReq.getNotes());

            if (itemReq.getEmployeeAllocationId() != null) {
                EmployeeAllocation alloc = employeeAllocationRepository.findById(itemReq.getEmployeeAllocationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Employee allocation not found: " + itemReq.getEmployeeAllocationId()));
                if (!alloc.getTechnicalProject().getId().equals(technicalProjectId)) {
                    throw new ResourceConflictException("Employee allocation does not belong to this technical project.");
                }
                item.setEmployeeAllocation(alloc);
            }

            estimate.addLineItem(item);
        }

        recalculateTotals(estimate, request.getContingencyAmount());

        estimate = departmentEstimateRepository.save(estimate);
        return mapToDepartmentDTO(estimate);
    }

    @Transactional
    public DepartmentEstimateDTO submitDepartmentEstimate(UUID technicalProjectId, UUID departmentId) {
        validateDepartmentAccess(departmentId, true);

        TechnicalProject project = technicalProjectRepository.findById(technicalProjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Technical project not found: " + technicalProjectId));

        if (project.getStatus() != TechnicalProjectStatus.TEAM_READY) {
            throw new ResourceConflictException("Project must be in TEAM_READY status to submit costing.");
        }

        DepartmentTechnicalEstimate estimate = departmentEstimateRepository
                .findFirstByTechnicalProjectIdAndDepartmentIdOrderByVersionNumberDesc(technicalProjectId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No estimate found for department " + departmentId));

        if (estimate.getStatus() == DepartmentEstimateStatus.SUBMITTED || estimate.getStatus() == DepartmentEstimateStatus.APPROVED) {
            throw new ResourceConflictException("Estimate has already been submitted or approved.");
        }

        estimate.setStatus(DepartmentEstimateStatus.SUBMITTED);
        estimate.setSubmittedBy(getAuthenticatedUser());
        estimate.setSubmittedAt(OffsetDateTime.now());

        estimate = departmentEstimateRepository.save(estimate);
        return mapToDepartmentDTO(estimate);
    }

    @Transactional(readOnly = true)
    public List<DepartmentEstimateDTO> getDepartmentEstimateHistory(UUID technicalProjectId, UUID departmentId) {
        validateDepartmentAccess(departmentId, false);
        return departmentEstimateRepository
                .findByTechnicalProjectIdAndDepartmentIdOrderByVersionNumberDesc(technicalProjectId, departmentId)
                .stream()
                .map(this::mapToDepartmentDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentEstimateDTO> getSubmittedOrLatestEstimatesForProject(UUID technicalProjectId) {
        validateCoordinatorOrAdmin();
        List<TechnicalProjectDepartment> departments = technicalProjectDepartmentRepository.findByTechnicalProjectId(technicalProjectId);
        List<DepartmentEstimateDTO> results = new ArrayList<>();
        for (TechnicalProjectDepartment dept : departments) {
            departmentEstimateRepository
                    .findFirstByTechnicalProjectIdAndDepartmentIdOrderByVersionNumberDesc(technicalProjectId, dept.getDepartment().getId())
                    .ifPresent(est -> results.add(mapToDepartmentDTO(est)));
        }
        return results;
    }

    @Transactional
    public DepartmentEstimateDTO requestRevision(UUID technicalProjectId, UUID departmentId, RevisionRequest request) {
        validateCoordinatorOrAdmin();

        DepartmentTechnicalEstimate estimate = departmentEstimateRepository
                .findFirstByTechnicalProjectIdAndDepartmentIdOrderByVersionNumberDesc(technicalProjectId, departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No estimate found for department " + departmentId));

        if (estimate.getStatus() != DepartmentEstimateStatus.SUBMITTED) {
            throw new ResourceConflictException("Can only request revision on a SUBMITTED estimate.");
        }

        estimate.setStatus(DepartmentEstimateStatus.REVISION_REQUESTED);
        estimate.setRevisionNotes(request.getRevisionNotes());

        estimate = departmentEstimateRepository.save(estimate);
        return mapToDepartmentDTO(estimate);
    }

    // ========================================================================================
    // Consolidated Technical Estimate Methods
    // ========================================================================================

    @Transactional
    public ConsolidatedTechnicalEstimateDTO consolidateAndApprove(UUID technicalProjectId) {
        validateCoordinatorOrAdmin();

        TechnicalProject project = technicalProjectRepository.findById(technicalProjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Technical project not found: " + technicalProjectId));

        if (project.getStatus() != TechnicalProjectStatus.TEAM_READY) {
            throw new ResourceConflictException("Project must be in TEAM_READY status to consolidate costing.");
        }

        if (consolidatedRepository.existsByTechnicalProjectIdAndStatus(technicalProjectId, ConsolidatedEstimateStatus.APPROVED)) {
            throw new ResourceConflictException("An approved technical estimate already exists for this project.");
        }

        List<TechnicalProjectDepartment> routedDepartments = technicalProjectDepartmentRepository.findByTechnicalProjectId(technicalProjectId);
        if (routedDepartments.isEmpty()) {
            throw new ResourceConflictException("No departments routed for this technical project.");
        }

        List<DepartmentTechnicalEstimate> submittedEstimates = new ArrayList<>();
        for (TechnicalProjectDepartment dept : routedDepartments) {
            DepartmentTechnicalEstimate est = departmentEstimateRepository
                    .findFirstByTechnicalProjectIdAndDepartmentIdOrderByVersionNumberDesc(technicalProjectId, dept.getDepartment().getId())
                    .orElseThrow(() -> new ResourceConflictException("Department " + dept.getDepartment().getName() + " has not submitted an estimate yet."));

            if (est.getStatus() != DepartmentEstimateStatus.SUBMITTED) {
                throw new ResourceConflictException("All department estimates must be SUBMITTED before consolidating. Department " + dept.getDepartment().getName() + " is currently in status " + est.getStatus() + ".");
            }
            submittedEstimates.add(est);
        }

        int newVersion = consolidatedRepository.findFirstByTechnicalProjectIdOrderByVersionNumberDesc(technicalProjectId)
                .map(c -> c.getVersionNumber() + 1)
                .orElse(1);

        ConsolidatedTechnicalEstimate consolidated = new ConsolidatedTechnicalEstimate();
        consolidated.setTechnicalProject(project);
        consolidated.setVersionNumber(newVersion);
        consolidated.setStatus(ConsolidatedEstimateStatus.APPROVED);
        consolidated.setApprovedBy(getAuthenticatedUser());
        consolidated.setApprovedAt(OffsetDateTime.now());
        consolidated.setCreatedBy(getAuthenticatedUser());

        // Sum category totals across all line items
        BigDecimal materials = BigDecimal.ZERO;
        BigDecimal labour = BigDecimal.ZERO;
        BigDecimal machines = BigDecimal.ZERO;
        BigDecimal software = BigDecimal.ZERO;
        BigDecimal transport = BigDecimal.ZERO;
        BigDecimal installation = BigDecimal.ZERO;
        BigDecimal testing = BigDecimal.ZERO;
        BigDecimal subcontracting = BigDecimal.ZERO;
        BigDecimal maintenance = BigDecimal.ZERO;
        BigDecimal contingencyCost = BigDecimal.ZERO;
        BigDecimal taxOther = BigDecimal.ZERO;

        BigDecimal totalSubtotal = BigDecimal.ZERO;
        BigDecimal totalContingencyAmt = BigDecimal.ZERO;
        BigDecimal totalTaxAmt = BigDecimal.ZERO;
        BigDecimal totalMarginAmt = BigDecimal.ZERO;
        BigDecimal totalFinalAmt = BigDecimal.ZERO;

        int maxDesign = 0;
        int maxProcurement = 0;
        int maxDevelopment = 0;
        int maxTesting = 0;
        int maxInstallation = 0;
        int maxTraining = 0;
        int maxDelivery = 0;

        for (DepartmentTechnicalEstimate est : submittedEstimates) {
            for (DepartmentEstimateLineItem item : est.getLineItems()) {
                switch (item.getCategory()) {
                    case MATERIALS -> materials = materials.add(item.getTotalCost());
                    case LABOUR -> labour = labour.add(item.getTotalCost());
                    case MACHINES_EQUIPMENT -> machines = machines.add(item.getTotalCost());
                    case SOFTWARE -> software = software.add(item.getTotalCost());
                    case TRANSPORT -> transport = transport.add(item.getTotalCost());
                    case INSTALLATION -> installation = installation.add(item.getTotalCost());
                    case TESTING -> testing = testing.add(item.getTotalCost());
                    case SUBCONTRACTING -> subcontracting = subcontracting.add(item.getTotalCost());
                    case MAINTENANCE -> maintenance = maintenance.add(item.getTotalCost());
                    case CONTINGENCY -> contingencyCost = contingencyCost.add(item.getTotalCost());
                    case TAX_OTHER_COSTS -> taxOther = taxOther.add(item.getTotalCost());
                }
            }

            totalSubtotal = totalSubtotal.add(est.getSubtotal());
            totalContingencyAmt = totalContingencyAmt.add(est.getContingencyAmount());
            totalTaxAmt = totalTaxAmt.add(est.getTaxAmount());
            totalMarginAmt = totalMarginAmt.add(est.getMarginAmount());
            totalFinalAmt = totalFinalAmt.add(est.getFinalTotal());

            maxDesign = Math.max(maxDesign, est.getDesignDurationDays() != null ? est.getDesignDurationDays() : 0);
            maxProcurement = Math.max(maxProcurement, est.getProcurementDurationDays() != null ? est.getProcurementDurationDays() : 0);
            maxDevelopment = Math.max(maxDevelopment, est.getDevelopmentDurationDays() != null ? est.getDevelopmentDurationDays() : 0);
            maxTesting = Math.max(maxTesting, est.getTestingDurationDays() != null ? est.getTestingDurationDays() : 0);
            maxInstallation = Math.max(maxInstallation, est.getInstallationDurationDays() != null ? est.getInstallationDurationDays() : 0);
            maxTraining = Math.max(maxTraining, est.getTrainingDurationDays() != null ? est.getTrainingDurationDays() : 0);
            maxDelivery = Math.max(maxDelivery, est.getDeliveryDurationDays() != null ? est.getDeliveryDurationDays() : 0);

            // Mark department estimate as APPROVED
            est.setStatus(DepartmentEstimateStatus.APPROVED);
            departmentEstimateRepository.save(est);
        }

        consolidated.setTotalMaterialsCost(materials.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalLabourCost(labour.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalMachinesEquipmentCost(machines.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalSoftwareCost(software.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalTransportCost(transport.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalInstallationCost(installation.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalTestingCost(testing.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalSubcontractingCost(subcontracting.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalMaintenanceCost(maintenance.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalContingencyCost(contingencyCost.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTotalTaxOtherCost(taxOther.setScale(2, RoundingMode.HALF_UP));

        consolidated.setSubtotal(totalSubtotal.setScale(2, RoundingMode.HALF_UP));
        consolidated.setContingencyAmount(totalContingencyAmt.setScale(2, RoundingMode.HALF_UP));
        consolidated.setTaxAmount(totalTaxAmt.setScale(2, RoundingMode.HALF_UP));
        consolidated.setMarginAmount(totalMarginAmt.setScale(2, RoundingMode.HALF_UP));
        consolidated.setFinalTotal(totalFinalAmt.setScale(2, RoundingMode.HALF_UP));

        consolidated.setTotalDesignDurationDays(maxDesign);
        consolidated.setTotalProcurementDurationDays(maxProcurement);
        consolidated.setTotalDevelopmentDurationDays(maxDevelopment);
        consolidated.setTotalTestingDurationDays(maxTesting);
        consolidated.setTotalInstallationDurationDays(maxInstallation);
        consolidated.setTotalTrainingDurationDays(maxTraining);
        consolidated.setTotalDeliveryDurationDays(maxDelivery);

        consolidated.setDepartmentEstimates(new ArrayList<>(submittedEstimates));

        consolidated = consolidatedRepository.save(consolidated);
        return mapToConsolidatedDTO(consolidated);
    }

    @Transactional(readOnly = true)
    public Optional<ConsolidatedTechnicalEstimateDTO> getLatestConsolidatedEstimate(UUID technicalProjectId) {
        return consolidatedRepository.findFirstByTechnicalProjectIdOrderByVersionNumberDesc(technicalProjectId)
                .map(this::mapToConsolidatedDTO);
    }

    @Transactional(readOnly = true)
    public List<ConsolidatedTechnicalEstimateDTO> getConsolidatedEstimateHistory(UUID technicalProjectId) {
        return consolidatedRepository.findByTechnicalProjectIdOrderByVersionNumberDesc(technicalProjectId)
                .stream()
                .map(this::mapToConsolidatedDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApprovedTechnicalEstimateSummaryDTO getApprovedEstimateSummary(UUID technicalProjectId) {
        ConsolidatedTechnicalEstimate approved = consolidatedRepository
                .findFirstByTechnicalProjectIdAndStatusOrderByVersionNumberDesc(technicalProjectId, ConsolidatedEstimateStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("No approved technical estimate found for project " + technicalProjectId));

        ApprovedTechnicalEstimateSummaryDTO summary = new ApprovedTechnicalEstimateSummaryDTO();
        summary.setId(approved.getId());
        summary.setTechnicalProjectId(technicalProjectId);
        if (approved.getTechnicalProject() != null) {
            summary.setProjectCode(approved.getTechnicalProject().getProjectCode());
            summary.setProjectTitle(resolveProjectTitle(approved.getTechnicalProject()));
        }
        summary.setVersionNumber(approved.getVersionNumber());
        summary.setStatus(approved.getStatus());
        summary.setSubtotal(approved.getSubtotal());
        summary.setContingencyAmount(approved.getContingencyAmount());
        summary.setTaxAmount(approved.getTaxAmount());
        summary.setMarginAmount(approved.getMarginAmount());
        summary.setFinalTotal(approved.getFinalTotal());

        int totalDays = approved.getTotalDesignDurationDays() + approved.getTotalProcurementDurationDays()
                + approved.getTotalDevelopmentDurationDays() + approved.getTotalTestingDurationDays()
                + approved.getTotalInstallationDurationDays() + approved.getTotalTrainingDurationDays()
                + approved.getTotalDeliveryDurationDays();
        summary.setTotalDurationDays(totalDays);
        summary.setApprovedAt(approved.getApprovedAt());
        if (approved.getApprovedBy() != null) {
            summary.setApprovedByName(resolveUserDisplayName(approved.getApprovedBy()));
        }

        Map<EstimateLineItemCategory, BigDecimal> breakdown = new HashMap<>();
        breakdown.put(EstimateLineItemCategory.MATERIALS, approved.getTotalMaterialsCost());
        breakdown.put(EstimateLineItemCategory.LABOUR, approved.getTotalLabourCost());
        breakdown.put(EstimateLineItemCategory.MACHINES_EQUIPMENT, approved.getTotalMachinesEquipmentCost());
        breakdown.put(EstimateLineItemCategory.SOFTWARE, approved.getTotalSoftwareCost());
        breakdown.put(EstimateLineItemCategory.TRANSPORT, approved.getTotalTransportCost());
        breakdown.put(EstimateLineItemCategory.INSTALLATION, approved.getTotalInstallationCost());
        breakdown.put(EstimateLineItemCategory.TESTING, approved.getTotalTestingCost());
        breakdown.put(EstimateLineItemCategory.SUBCONTRACTING, approved.getTotalSubcontractingCost());
        breakdown.put(EstimateLineItemCategory.MAINTENANCE, approved.getTotalMaintenanceCost());
        breakdown.put(EstimateLineItemCategory.CONTINGENCY, approved.getTotalContingencyCost());
        breakdown.put(EstimateLineItemCategory.TAX_OTHER_COSTS, approved.getTotalTaxOtherCost());
        summary.setCategoryBreakdown(breakdown);

        return summary;
    }

    @Transactional(readOnly = true)
    public boolean hasApprovedEstimate(UUID technicalProjectId) {
        return consolidatedRepository.existsByTechnicalProjectIdAndStatus(technicalProjectId, ConsolidatedEstimateStatus.APPROVED);
    }

    @Transactional(readOnly = true)
    public void validateProjectHasApprovedEstimate(UUID technicalProjectId) {
        if (!hasApprovedEstimate(technicalProjectId)) {
            throw new ResourceConflictException("Phase 9 is blocked: An approved Technical Estimate is required for project " + technicalProjectId);
        }
    }

    // ========================================================================================
    // Helper Methods
    // ========================================================================================

    private void recalculateTotals(DepartmentTechnicalEstimate estimate, BigDecimal explicitContingencyAmount) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (DepartmentEstimateLineItem item : estimate.getLineItems()) {
            subtotal = subtotal.add(item.getTotalCost());
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        estimate.setSubtotal(subtotal);

        BigDecimal contingencyAmount;
        if (estimate.getContingencyPercentage() != null && estimate.getContingencyPercentage().compareTo(BigDecimal.ZERO) > 0) {
            contingencyAmount = subtotal.multiply(estimate.getContingencyPercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if (explicitContingencyAmount != null && explicitContingencyAmount.compareTo(BigDecimal.ZERO) > 0) {
            contingencyAmount = explicitContingencyAmount.setScale(2, RoundingMode.HALF_UP);
        } else {
            contingencyAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        estimate.setContingencyAmount(contingencyAmount);

        BigDecimal taxBase = subtotal.add(contingencyAmount);
        BigDecimal taxAmount = BigDecimal.ZERO;
        if (estimate.getTaxPercentage() != null && estimate.getTaxPercentage().compareTo(BigDecimal.ZERO) > 0) {
            taxAmount = taxBase.multiply(estimate.getTaxPercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        estimate.setTaxAmount(taxAmount);

        BigDecimal marginAmount = BigDecimal.ZERO;
        if (estimate.getMarginPercentage() != null && estimate.getMarginPercentage().compareTo(BigDecimal.ZERO) > 0) {
            marginAmount = taxBase.multiply(estimate.getMarginPercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        estimate.setMarginAmount(marginAmount);

        BigDecimal finalTotal = subtotal.add(contingencyAmount).add(taxAmount).add(marginAmount)
                .setScale(2, RoundingMode.HALF_UP);
        estimate.setFinalTotal(finalTotal);
    }

    private DepartmentEstimateDTO mapToDepartmentDTO(DepartmentTechnicalEstimate estimate) {
        DepartmentEstimateDTO dto = new DepartmentEstimateDTO();
        dto.setId(estimate.getId());
        if (estimate.getTechnicalProject() != null) {
            dto.setTechnicalProjectId(estimate.getTechnicalProject().getId());
        }
        if (estimate.getDepartment() != null) {
            dto.setDepartmentId(estimate.getDepartment().getId());
            dto.setDepartmentName(estimate.getDepartment().getName());
            dto.setDepartmentCode(estimate.getDepartment().getCode());
        }
        dto.setVersionNumber(estimate.getVersionNumber());
        dto.setStatus(estimate.getStatus());
        dto.setSubtotal(estimate.getSubtotal());
        dto.setContingencyPercentage(estimate.getContingencyPercentage());
        dto.setContingencyAmount(estimate.getContingencyAmount());
        dto.setTaxPercentage(estimate.getTaxPercentage());
        dto.setTaxAmount(estimate.getTaxAmount());
        dto.setMarginPercentage(estimate.getMarginPercentage());
        dto.setMarginAmount(estimate.getMarginAmount());
        dto.setFinalTotal(estimate.getFinalTotal());

        dto.setDesignDurationDays(estimate.getDesignDurationDays());
        dto.setProcurementDurationDays(estimate.getProcurementDurationDays());
        dto.setDevelopmentDurationDays(estimate.getDevelopmentDurationDays());
        dto.setTestingDurationDays(estimate.getTestingDurationDays());
        dto.setInstallationDurationDays(estimate.getInstallationDurationDays());
        dto.setTrainingDurationDays(estimate.getTrainingDurationDays());
        dto.setDeliveryDurationDays(estimate.getDeliveryDurationDays());

        if (estimate.getSubmittedBy() != null) {
            dto.setSubmittedBy(estimate.getSubmittedBy().getId());
            dto.setSubmittedByName(resolveUserDisplayName(estimate.getSubmittedBy()));
        }
        dto.setSubmittedAt(estimate.getSubmittedAt());
        dto.setRevisionNotes(estimate.getRevisionNotes());
        dto.setCreatedAt(estimate.getCreatedAt());
        dto.setUpdatedAt(estimate.getUpdatedAt());

        List<DepartmentEstimateLineItemDTO> itemDTOs = estimate.getLineItems().stream()
                .map(item -> {
                    DepartmentEstimateLineItemDTO itemDto = new DepartmentEstimateLineItemDTO();
                    itemDto.setId(item.getId());
                    itemDto.setCategory(item.getCategory());
                    itemDto.setDescription(item.getDescription());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setUnitOfMeasure(item.getUnitOfMeasure());
                    itemDto.setUnitCost(item.getUnitCost());
                    itemDto.setTotalCost(item.getTotalCost());
                    itemDto.setNotes(item.getNotes());
                    if (item.getEmployeeAllocation() != null) {
                        EmployeeAllocation alloc = item.getEmployeeAllocation();
                        itemDto.setEmployeeAllocationId(alloc.getId());
                        itemDto.setEmployeeName(resolveEmployeeDisplayName(alloc.getEmployee()));
                        itemDto.setProjectRole(resolveAllocationProjectRole(alloc));
                    }
                    return itemDto;
                })
                .collect(Collectors.toList());

        dto.setLineItems(itemDTOs);
        return dto;
    }

    private ConsolidatedTechnicalEstimateDTO mapToConsolidatedDTO(ConsolidatedTechnicalEstimate estimate) {
        ConsolidatedTechnicalEstimateDTO dto = new ConsolidatedTechnicalEstimateDTO();
        dto.setId(estimate.getId());
        if (estimate.getTechnicalProject() != null) {
            dto.setTechnicalProjectId(estimate.getTechnicalProject().getId());
            dto.setProjectCode(estimate.getTechnicalProject().getProjectCode());
            dto.setProjectTitle(resolveProjectTitle(estimate.getTechnicalProject()));
        }
        dto.setVersionNumber(estimate.getVersionNumber());
        dto.setStatus(estimate.getStatus());

        dto.setTotalMaterialsCost(estimate.getTotalMaterialsCost());
        dto.setTotalLabourCost(estimate.getTotalLabourCost());
        dto.setTotalMachinesEquipmentCost(estimate.getTotalMachinesEquipmentCost());
        dto.setTotalSoftwareCost(estimate.getTotalSoftwareCost());
        dto.setTotalTransportCost(estimate.getTotalTransportCost());
        dto.setTotalInstallationCost(estimate.getTotalInstallationCost());
        dto.setTotalTestingCost(estimate.getTotalTestingCost());
        dto.setTotalSubcontractingCost(estimate.getTotalSubcontractingCost());
        dto.setTotalMaintenanceCost(estimate.getTotalMaintenanceCost());
        dto.setTotalContingencyCost(estimate.getTotalContingencyCost());
        dto.setTotalTaxOtherCost(estimate.getTotalTaxOtherCost());

        dto.setSubtotal(estimate.getSubtotal());
        dto.setContingencyAmount(estimate.getContingencyAmount());
        dto.setTaxAmount(estimate.getTaxAmount());
        dto.setMarginAmount(estimate.getMarginAmount());
        dto.setFinalTotal(estimate.getFinalTotal());

        dto.setTotalDesignDurationDays(estimate.getTotalDesignDurationDays());
        dto.setTotalProcurementDurationDays(estimate.getTotalProcurementDurationDays());
        dto.setTotalDevelopmentDurationDays(estimate.getTotalDevelopmentDurationDays());
        dto.setTotalTestingDurationDays(estimate.getTotalTestingDurationDays());
        dto.setTotalInstallationDurationDays(estimate.getTotalInstallationDurationDays());
        dto.setTotalTrainingDurationDays(estimate.getTotalTrainingDurationDays());
        dto.setTotalDeliveryDurationDays(estimate.getTotalDeliveryDurationDays());

        if (estimate.getApprovedBy() != null) {
            dto.setApprovedBy(estimate.getApprovedBy().getId());
            dto.setApprovedByName(resolveUserDisplayName(estimate.getApprovedBy()));
        }
        dto.setApprovedAt(estimate.getApprovedAt());
        dto.setCreatedAt(estimate.getCreatedAt());
        dto.setUpdatedAt(estimate.getUpdatedAt());

        if (estimate.getDepartmentEstimates() != null) {
            List<DepartmentEstimateDTO> deptDtos = estimate.getDepartmentEstimates().stream()
                    .map(this::mapToDepartmentDTO)
                    .collect(Collectors.toList());
            dto.setDepartmentEstimates(deptDtos);
        }

        return dto;
    }
}
