package com.knoweb.salesmanagement.projectbrief.service;

import tools.jackson.databind.json.JsonMapper;
import com.knoweb.salesmanagement.common.exception.ProjectBriefSnapshotException;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.opportunity.service.SalesOpportunityService;
import com.knoweb.salesmanagement.projectbrief.dto.*;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefAttachment;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefVersion;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefAttachmentRepository;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefVersionRepository;
import com.knoweb.salesmanagement.projectbrief.util.ProjectBriefDeadlineUtil;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import com.knoweb.salesmanagement.notification.service.NotificationService;
import com.knoweb.salesmanagement.approval.service.WorkflowTransitionService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.audit.dto.InternalAuditLogEvent;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class ProjectBriefService {

    private final ProjectBriefRepository projectBriefRepository;
    private final ProjectBriefVersionRepository versionRepository;
    private final ProjectBriefAttachmentRepository attachmentRepository;
    private final SalesOpportunityRepository opportunityRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final SalesOpportunityService opportunityService;
    private final NotificationService notificationService;
    private final WorkflowTransitionService workflowTransitionService;
    private final JsonMapper jsonMapper;
    private final BdmApprovalRepository bdmApprovalRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ProjectBriefService(ProjectBriefRepository projectBriefRepository,
                               ProjectBriefVersionRepository versionRepository,
                               ProjectBriefAttachmentRepository attachmentRepository,
                               SalesOpportunityRepository opportunityRepository,
                               DepartmentRepository departmentRepository,
                               UserRepository userRepository,
                               EmployeeRepository employeeRepository,
                               SalesOpportunityService opportunityService,
                               NotificationService notificationService,
                               WorkflowTransitionService workflowTransitionService,
                               JsonMapper jsonMapper,
                               BdmApprovalRepository bdmApprovalRepository,
                               ApplicationEventPublisher eventPublisher) {
        this.projectBriefRepository = projectBriefRepository;
        this.versionRepository = versionRepository;
        this.attachmentRepository = attachmentRepository;
        this.opportunityRepository = opportunityRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.opportunityService = opportunityService;
        this.notificationService = notificationService;
        this.workflowTransitionService = workflowTransitionService;
        this.jsonMapper = jsonMapper;
        this.bdmApprovalRepository = bdmApprovalRepository;
        this.eventPublisher = eventPublisher;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private Employee getCurrentEmployee() {
        User user = getAuthenticatedUser();
        if (user == null) return null;
        return employeeRepository.findByUserId(user.getId()).orElse(null);
    }

    private boolean hasAuthority(String authority) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals(authority));
    }

    private void validateWriteAccess(SalesOpportunity opportunity) {
        if (hasAuthority("PROJECT_BRIEF_UPDATE")) return;
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee == null || opportunity.getAssignedSalesOfficer() == null || 
            !opportunity.getAssignedSalesOfficer().getId().equals(currentEmployee.getId())) {
            throw new AccessDeniedException("You do not have permission to manage this project brief");
        }
    }

    private void validateReadAccess(SalesOpportunity opportunity) {
        if (hasAuthority("PROJECT_BRIEF_READ")) return;
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee == null || opportunity.getAssignedSalesOfficer() == null || 
            !opportunity.getAssignedSalesOfficer().getId().equals(currentEmployee.getId())) {
            throw new AccessDeniedException("You do not have permission to read this project brief");
        }
    }

    @Transactional
    public ProjectBriefDTO initializeProjectBrief(UUID opportunityId) {
        SalesOpportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found"));
        
        validateWriteAccess(opp);

        Optional<ProjectBrief> existing = projectBriefRepository.findByOpportunityId(opportunityId);
        if (existing.isPresent()) {
            return mapToDTO(existing.get());
        }

        ProjectBrief brief = new ProjectBrief();
        brief.setOpportunity(opp);
        brief.setStatus(ProjectBriefStatus.DRAFT);
        brief.setDueAt(OffsetDateTime.now().plusHours(24));
        brief.setProjectTitle(opp.getTitle());
        brief.setExpectedBudget(opp.getEstimatedValue());
        brief.setCurrency(opp.getCurrency());
        brief.setExpectedDeadline(opp.getExpectedCloseDate());

        brief = projectBriefRepository.save(brief);

        opp.setStage(OpportunityStage.BRIEF_IN_PROGRESS);
        opportunityRepository.save(opp);

        opportunityService.logActivity(opp, "BRIEF_STARTED", "Project Brief drafting started");

        ProjectBriefDTO dto = mapToDTO(brief);
        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_BRIEF_CREATED");
        auditEvent.setEntityType("ProjectBrief");
        auditEvent.setEntityId(brief.getId());
        auditEvent.setAction("CREATE");
        auditEvent.setNewState(dto);
        eventPublisher.publishEvent(auditEvent);

        return dto;
    }

    private void validateMandatorySubmissionFields(ProjectBrief brief) {
        List<String> missingFields = new java.util.ArrayList<>();
        if (brief.getOpportunity() == null) missingFields.add("Opportunity");
        if (!org.springframework.util.StringUtils.hasText(brief.getProjectTitle())) missingFields.add("Project Title");
        if (!org.springframework.util.StringUtils.hasText(brief.getBusinessProblem())) missingFields.add("Business Problem");
        if (!org.springframework.util.StringUtils.hasText(brief.getRequiredSolution())) missingFields.add("Required Solution");
        if (!org.springframework.util.StringUtils.hasText(brief.getProjectScope())) missingFields.add("Project Scope");
        if (!org.springframework.util.StringUtils.hasText(brief.getTechnicalRequirements())) missingFields.add("Technical Requirements");
        if (brief.getExpectedBudget() == null || brief.getExpectedBudget().compareTo(java.math.BigDecimal.ZERO) <= 0) missingFields.add("Valid Expected Budget");
        if (brief.getExpectedDeadline() == null) missingFields.add("Expected Deadline");
        if (brief.getRequiredDepartments() == null || brief.getRequiredDepartments().isEmpty()) missingFields.add("At least one Required Department");

        if (!missingFields.isEmpty()) {
            throw new IllegalArgumentException("Cannot submit project brief. Mandatory fields missing or invalid: " + String.join(", ", missingFields));
        }
    }

    @Transactional
    public ProjectBriefDTO updateDraft(UUID briefId, ProjectBriefUpdateDraftRequest request) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        
        validateWriteAccess(brief.getOpportunity());

        if (brief.getStatus() != ProjectBriefStatus.DRAFT && 
            brief.getStatus() != ProjectBriefStatus.BDM_RETURNED_FOR_REVISION && 
            brief.getStatus() != ProjectBriefStatus.BDM_INFORMATION_REQUESTED && 
            brief.getStatus() != ProjectBriefStatus.CLIENT_CHANGES_REQUESTED) {
            throw new ResourceConflictException("Cannot update project brief in its current status: " + brief.getStatus());
        }

        if (request.getVersionNumber() != null && !request.getVersionNumber().equals(brief.getCurrentVersionNumber())) {
            throw new ResourceConflictException("The project brief has been updated by someone else. Please refresh and try again.");
        }

        brief.setProjectTitle(request.getProjectTitle());
        brief.setBusinessProblem(request.getBusinessProblem());
        brief.setRequiredSolution(request.getRequiredSolution());
        brief.setProjectScope(request.getProjectScope());
        brief.setTechnicalRequirements(request.getTechnicalRequirements());
        brief.setExpectedBudget(request.getExpectedBudget());
        brief.setCurrency(request.getCurrency());
        brief.setExpectedDeadline(request.getExpectedDeadline());
        brief.setSiteName(request.getSiteName());
        brief.setSiteAddress(request.getSiteAddress());
        brief.setSiteInformation(request.getSiteInformation());
        brief.setMeetingNotes(request.getMeetingNotes());
        brief.setSpecialConditions(request.getSpecialConditions());

        if (request.getRequiredDepartmentIds() != null) {
            List<Department> depts = departmentRepository.findAllById(request.getRequiredDepartmentIds());
            brief.setRequiredDepartments(new HashSet<>(depts));
        } else {
            brief.getRequiredDepartments().clear();
        }

        ProjectBriefDTO previousState = mapToDTO(brief);
        brief = projectBriefRepository.save(brief);

        ProjectBriefDTO newState = mapToDTO(brief);
        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_BRIEF_UPDATED");
        auditEvent.setEntityType("ProjectBrief");
        auditEvent.setEntityId(brief.getId());
        auditEvent.setAction("UPDATE");
        auditEvent.setPreviousState(previousState);
        auditEvent.setNewState(newState);
        eventPublisher.publishEvent(auditEvent);

        return newState;
    }

    @Transactional
    public ProjectBriefDTO saveVersion(UUID briefId, ProjectBriefUpdateDraftRequest request) {
        ProjectBrief briefCheck = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        if (briefCheck.getStatus() != ProjectBriefStatus.DRAFT && 
            briefCheck.getStatus() != ProjectBriefStatus.BDM_RETURNED_FOR_REVISION && 
            briefCheck.getStatus() != ProjectBriefStatus.BDM_INFORMATION_REQUESTED && 
            briefCheck.getStatus() != ProjectBriefStatus.CLIENT_CHANGES_REQUESTED) {
            throw new ResourceConflictException("Cannot create a new version for project brief in its current status: " + briefCheck.getStatus());
        }

        ProjectBriefDTO dto = updateDraft(briefId, request);
        ProjectBrief brief = projectBriefRepository.findById(briefId).orElseThrow();
        
        brief.setCurrentVersionNumber(brief.getCurrentVersionNumber() + 1);
        brief = projectBriefRepository.save(brief);
        
        ProjectBriefVersion version = new ProjectBriefVersion();
        version.setProjectBrief(brief);
        version.setVersionNumber(brief.getCurrentVersionNumber());
        version.setSubmittedVersion(false);
        version.setCreatedBy(getAuthenticatedUser() != null ? getAuthenticatedUser().getId() : null);
        version.setChangeSummary(request.getChangeSummary());
        
        ProjectBriefDTO snapshotDto = null;
        try {
            snapshotDto = mapToDTO(brief);
            String jsonSnapshot = jsonMapper.writeValueAsString(snapshotDto);
            version.setSnapshot(jsonSnapshot);
        } catch (Exception e) {
            System.err.println("Failed to serialize snapshot: " + e.getMessage());
            throw new ProjectBriefSnapshotException("Failed to serialize project brief snapshot", e);
        }

        try {
            versionRepository.saveAndFlush(version);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ResourceConflictException("Version conflict! This version number was already created by another request. Please refresh and try again.");
        }
        
        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_BRIEF_VERSION_SAVED");
        auditEvent.setEntityType("ProjectBrief");
        auditEvent.setEntityId(brief.getId());
        auditEvent.setAction("SAVE_VERSION");
        auditEvent.setNewState(snapshotDto != null ? snapshotDto : mapToDTO(brief));
        eventPublisher.publishEvent(auditEvent);

        return snapshotDto != null ? snapshotDto : mapToDTO(brief);
    }

    @Transactional
    public ProjectBriefDTO submitProjectBrief(UUID briefId, ProjectBriefSubmitRequest request) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        
        validateWriteAccess(brief.getOpportunity());

        if (brief.getStatus() != ProjectBriefStatus.DRAFT && 
            brief.getStatus() != ProjectBriefStatus.BDM_RETURNED_FOR_REVISION && 
            brief.getStatus() != ProjectBriefStatus.BDM_INFORMATION_REQUESTED && 
            brief.getStatus() != ProjectBriefStatus.CLIENT_CHANGES_REQUESTED) {
            throw new ResourceConflictException("Project brief cannot be submitted from current status: " + brief.getStatus());
        }

        validateMandatorySubmissionFields(brief);

        workflowTransitionService.submitProjectBrief(brief, getAuthenticatedUser());
        
        brief.setSubmittedAt(OffsetDateTime.now());
        brief.setSubmittedBy(getAuthenticatedUser());
        
        brief.setCurrentVersionNumber(brief.getCurrentVersionNumber() + 1);
        
        brief = projectBriefRepository.save(brief);

        SalesOpportunity opp = brief.getOpportunity();
        opportunityRepository.save(opp);

        opportunityService.logActivity(opp, "BRIEF_SUBMITTED", "Project Brief submitted for BDM Review");

        ProjectBriefVersion version = new ProjectBriefVersion();
        version.setProjectBrief(brief);
        version.setVersionNumber(brief.getCurrentVersionNumber());
        version.setSubmittedVersion(true);
        version.setCreatedBy(getAuthenticatedUser() != null ? getAuthenticatedUser().getId() : null);
        
        ProjectBriefDTO snapshotDto = null;
        try {
            snapshotDto = mapToDTO(brief);
            String jsonSnapshot = jsonMapper.writeValueAsString(snapshotDto);
            version.setSnapshot(jsonSnapshot);
        } catch (Exception e) {
            System.err.println("Failed to serialize snapshot: " + e.getMessage());
            throw new ProjectBriefSnapshotException("Failed to serialize project brief snapshot", e);
        }

        try {
            versionRepository.saveAndFlush(version);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ResourceConflictException("Version conflict! This version number was already created by another request. Please refresh and try again.");
        }

        if (bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(brief.getId(), brief.getCurrentVersionNumber(), BdmApprovalStatus.PENDING).isPresent()) {
            throw new ResourceConflictException("An active BDM approval request already exists for this version.");
        }

        BdmApproval approval = new BdmApproval();
        approval.setOpportunity(opp);
        approval.setProjectBrief(brief);
        approval.setProjectBriefVersionNumber(brief.getCurrentVersionNumber());
        approval.setStatus(BdmApprovalStatus.PENDING);
        bdmApprovalRepository.save(approval);

        List<User> bdms = userRepository.findByRolesCode("BDM");
        for (User bdm : bdms) {
            notificationService.createNotification(
                    bdm,
                    "PROJECT_BRIEF_SUBMITTED",
                    "Project Brief Submitted",
                    "A new project brief has been submitted for opportunity " + opp.getOpportunityNumber() + ".",
                    "PROJECT_BRIEF",
                    brief.getId(),
                    "PB_SUBMITTED_" + brief.getId().toString()
            );
        }

        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_BRIEF_SUBMITTED");
        auditEvent.setEntityType("ProjectBrief");
        auditEvent.setEntityId(brief.getId());
        auditEvent.setAction("SUBMIT");
        auditEvent.setNewState(snapshotDto != null ? snapshotDto : mapToDTO(brief));
        eventPublisher.publishEvent(auditEvent);

        return snapshotDto != null ? snapshotDto : mapToDTO(brief);
    }

    public List<ProjectBriefVersionDTO> getProjectBriefVersions(UUID briefId) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        validateReadAccess(brief.getOpportunity());
        
        return versionRepository.findByProjectBriefIdOrderByVersionNumberDesc(briefId)
                .stream()
                .map(this::mapVersionToDTO)
                .collect(Collectors.toList());
    }

    public ProjectBriefVersionDTO getProjectBriefVersion(UUID briefId, Integer versionNumber) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        validateReadAccess(brief.getOpportunity());
        
        ProjectBriefVersion version = versionRepository.findByProjectBriefIdAndVersionNumber(briefId, versionNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Version not found"));
        
        return mapVersionToDTO(version);
    }

    private ProjectBriefVersionDTO mapVersionToDTO(ProjectBriefVersion entity) {
        ProjectBriefVersionDTO dto = new ProjectBriefVersionDTO();
        dto.setId(entity.getId());
        dto.setProjectBriefId(entity.getProjectBrief().getId());
        dto.setVersionNumber(entity.getVersionNumber());
        dto.setSnapshot(entity.getSnapshot());
        dto.setChangeSummary(entity.getChangeSummary());
        dto.setSubmittedVersion(entity.isSubmittedVersion());
        dto.setCreatedAt(entity.getCreatedAt());
        
        if (entity.getCreatedBy() != null) {
            User user = userRepository.findById(entity.getCreatedBy()).orElse(null);
            if (user != null) {
                dto.setCreatedById(user.getId());
                dto.setCreatedByName(user.getFirstName() + " " + user.getLastName());
            }
        }
        return dto;
    }
    
    @Transactional
    public ProjectBriefAttachmentDTO addAttachment(UUID briefId, com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefAttachmentRequest request) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        validateWriteAccess(brief.getOpportunity());

        if (brief.getStatus() != ProjectBriefStatus.DRAFT && 
            brief.getStatus() != ProjectBriefStatus.BDM_RETURNED_FOR_REVISION && 
            brief.getStatus() != ProjectBriefStatus.BDM_INFORMATION_REQUESTED && 
            brief.getStatus() != ProjectBriefStatus.CLIENT_CHANGES_REQUESTED) {
            throw new ResourceConflictException("Cannot add attachments to project brief in its current status");
        }
        
        ProjectBriefAttachment attachment = new ProjectBriefAttachment();
        attachment.setProjectBrief(brief);
        attachment.setFileName(request.getFileName());
        attachment.setFileType(request.getFileType());
        attachment.setFileUrl(request.getFileUrl());
        attachment.setFileSize(request.getFileSize());
        attachment.setCreatedBy(getAuthenticatedUser() != null ? getAuthenticatedUser().getId() : null);
        
        attachment = attachmentRepository.save(attachment);
        return mapAttachmentToDTO(attachment);
    }

    @Transactional
    public ProjectBriefAttachmentDTO uploadAttachment(UUID briefId, org.springframework.web.multipart.MultipartFile file) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        validateWriteAccess(brief.getOpportunity());

        if (brief.getStatus() != ProjectBriefStatus.DRAFT && 
            brief.getStatus() != ProjectBriefStatus.BDM_RETURNED_FOR_REVISION && 
            brief.getStatus() != ProjectBriefStatus.BDM_INFORMATION_REQUESTED && 
            brief.getStatus() != ProjectBriefStatus.CLIENT_CHANGES_REQUESTED) {
            throw new ResourceConflictException("Cannot add attachments to project brief in its current status");
        }

        String originalFileName = org.springframework.util.StringUtils.cleanPath(java.util.Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFileName.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence: " + originalFileName);
        }

        String lowerCaseName = originalFileName.toLowerCase();
        if (!lowerCaseName.endsWith(".pdf") && 
            !lowerCaseName.endsWith(".docx") && 
            !lowerCaseName.endsWith(".jpg") && 
            !lowerCaseName.endsWith(".jpeg") && 
            !lowerCaseName.endsWith(".png") &&
            !lowerCaseName.endsWith(".txt") &&
            !lowerCaseName.endsWith(".xlsx")) {
            throw new IllegalArgumentException("Invalid file type. Allowed formats: PDF, DOCX, JPG, PNG, TXT, XLSX.");
        }

        long maxSizeBytes = 10 * 1024 * 1024;
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException("File size exceeds maximum allowed limit of 10MB.");
        }

        String sanitizedFileName = originalFileName.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
        String uniqueFileName = UUID.randomUUID().toString() + "_" + sanitizedFileName;

        java.nio.file.Path storageDir = java.nio.file.Paths.get("./uploads/project-briefs").toAbsolutePath().normalize();
        try {
            java.nio.file.Files.createDirectories(storageDir);
            java.nio.file.Path targetLocation = storageDir.resolve(uniqueFileName);
            java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to store attachment file: " + e.getMessage(), e);
        }

        ProjectBriefAttachment attachment = new ProjectBriefAttachment();
        attachment.setProjectBrief(brief);
        attachment.setFileName(originalFileName);
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setStoragePath(uniqueFileName);
        attachment.setFileUrl("/api/v1/project-briefs/" + briefId + "/attachments/download");
        attachment.setCreatedBy(getAuthenticatedUser() != null ? getAuthenticatedUser().getId() : null);

        attachment = attachmentRepository.save(attachment);
        attachment.setFileUrl("/api/v1/project-briefs/" + briefId + "/attachments/" + attachment.getId() + "/download");
        attachment = attachmentRepository.save(attachment);

        return mapAttachmentToDTO(attachment);
    }

    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource downloadAttachmentResource(UUID briefId, UUID attachmentId) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        validateReadAccess(brief.getOpportunity());

        ProjectBriefAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        if (!attachment.getProjectBrief().getId().equals(briefId)) {
            throw new ResourceNotFoundException("Attachment not found for this project brief");
        }

        try {
            java.nio.file.Path storageDir = java.nio.file.Paths.get("./uploads/project-briefs").toAbsolutePath().normalize();
            java.nio.file.Path filePath = storageDir.resolve(attachment.getStoragePath()).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Attachment file not found on disk");
            }
        } catch (Exception ex) {
            throw new ResourceNotFoundException("Attachment file could not be read");
        }
    }

    @Transactional
    public void deleteAttachment(UUID briefId, UUID attachmentId) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        validateWriteAccess(brief.getOpportunity());

        if (brief.getStatus() != ProjectBriefStatus.DRAFT && 
            brief.getStatus() != ProjectBriefStatus.BDM_RETURNED_FOR_REVISION && 
            brief.getStatus() != ProjectBriefStatus.BDM_INFORMATION_REQUESTED && 
            brief.getStatus() != ProjectBriefStatus.CLIENT_CHANGES_REQUESTED) {
            throw new ResourceConflictException("Cannot delete attachments from project brief in its current status");
        }

        ProjectBriefAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        if (!attachment.getProjectBrief().getId().equals(briefId)) {
            throw new ResourceNotFoundException("Attachment not found for this project brief");
        }

        if (attachment.getStoragePath() != null) {
            try {
                java.nio.file.Path storageDir = java.nio.file.Paths.get("./uploads/project-briefs").toAbsolutePath().normalize();
                java.nio.file.Path filePath = storageDir.resolve(attachment.getStoragePath()).normalize();
                java.nio.file.Files.deleteIfExists(filePath);
            } catch (java.io.IOException e) {
                // ignore disk delete error
            }
        }

        attachmentRepository.delete(attachment);
    }
    
    public List<ProjectBriefAttachmentDTO> getAttachments(UUID briefId) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        validateReadAccess(brief.getOpportunity());
        
        return attachmentRepository.findByProjectBriefIdOrderByCreatedAtDesc(briefId)
                .stream()
                .map(this::mapAttachmentToDTO)
                .collect(Collectors.toList());
    }

    private ProjectBriefAttachmentDTO mapAttachmentToDTO(ProjectBriefAttachment entity) {
        ProjectBriefAttachmentDTO dto = new ProjectBriefAttachmentDTO();
        dto.setId(entity.getId());
        dto.setProjectBriefId(entity.getProjectBrief().getId());
        dto.setFileName(entity.getFileName());
        dto.setFileType(entity.getFileType());
        dto.setFileUrl(entity.getFileUrl());
        dto.setFileSize(entity.getFileSize());
        dto.setCreatedAt(entity.getCreatedAt());
        
        if (entity.getCreatedBy() != null) {
            User user = userRepository.findById(entity.getCreatedBy()).orElse(null);
            if (user != null) {
                dto.setCreatedById(user.getId());
                dto.setCreatedByName(user.getFirstName() + " " + user.getLastName());
            }
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public ProjectBriefDTO getProjectBrief(UUID briefId) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        // Need read access
        validateReadAccess(brief.getOpportunity());
        return mapToDTO(brief);
    }

    private ProjectBriefDTO mapToDTO(ProjectBrief entity) {
        ProjectBriefDTO dto = new ProjectBriefDTO();
        dto.setId(entity.getId());
        dto.setOpportunityId(entity.getOpportunity().getId());
        dto.setStatus(entity.getStatus());
        dto.setCurrentVersionNumber(entity.getCurrentVersionNumber());
        dto.setProjectTitle(entity.getProjectTitle());
        dto.setBusinessProblem(entity.getBusinessProblem());
        dto.setRequiredSolution(entity.getRequiredSolution());
        dto.setProjectScope(entity.getProjectScope());
        dto.setTechnicalRequirements(entity.getTechnicalRequirements());
        dto.setExpectedBudget(entity.getExpectedBudget());
        dto.setCurrency(entity.getCurrency());
        dto.setExpectedDeadline(entity.getExpectedDeadline());
        dto.setSiteName(entity.getSiteName());
        dto.setSiteAddress(entity.getSiteAddress());
        dto.setSiteInformation(entity.getSiteInformation());
        dto.setMeetingNotes(entity.getMeetingNotes());
        dto.setSpecialConditions(entity.getSpecialConditions());
        dto.setDueAt(entity.getDueAt());
        
        dto.setOverdue(ProjectBriefDeadlineUtil.isOverdue(entity));
        dto.setOverdueHours(ProjectBriefDeadlineUtil.calculateOverdueHours(entity));
        dto.setDeadlineStatus(ProjectBriefDeadlineUtil.calculateDeadlineStatus(entity));

        dto.setSubmittedAt(entity.getSubmittedAt());
        if (entity.getSubmittedBy() != null) {
            dto.setSubmittedById(entity.getSubmittedBy().getId());
            dto.setSubmittedByName(entity.getSubmittedBy().getFirstName() + " " + entity.getSubmittedBy().getLastName());
        }
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getRequiredDepartments() != null) {
            dto.setRequiredDepartments(entity.getRequiredDepartments().stream().map(dept -> {
                DepartmentSummaryDTO deptDto = new DepartmentSummaryDTO();
                deptDto.setId(dept.getId());
                deptDto.setName(dept.getName());
                return deptDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
