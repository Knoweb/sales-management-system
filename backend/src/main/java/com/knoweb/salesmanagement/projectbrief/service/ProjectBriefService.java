package com.knoweb.salesmanagement.projectbrief.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final ObjectMapper objectMapper;

    public ProjectBriefService(ProjectBriefRepository projectBriefRepository,
                               ProjectBriefVersionRepository versionRepository,
                               ProjectBriefAttachmentRepository attachmentRepository,
                               SalesOpportunityRepository opportunityRepository,
                               DepartmentRepository departmentRepository,
                               UserRepository userRepository,
                               EmployeeRepository employeeRepository,
                               SalesOpportunityService opportunityService,
                               NotificationService notificationService) {
        this.projectBriefRepository = projectBriefRepository;
        this.versionRepository = versionRepository;
        this.attachmentRepository = attachmentRepository;
        this.opportunityRepository = opportunityRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.opportunityService = opportunityService;
        this.notificationService = notificationService;
        this.objectMapper = new ObjectMapper();
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
        if (hasAuthority("ROLE_SYSTEM_ADMIN")) return;
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee == null || opportunity.getAssignedSalesOfficer() == null || 
            !opportunity.getAssignedSalesOfficer().getId().equals(currentEmployee.getId())) {
            throw new AccessDeniedException("You do not have permission to manage this project brief");
        }
    }

    private void validateReadAccess(SalesOpportunity opportunity) {
        if (hasAuthority("ROLE_SYSTEM_ADMIN") || hasAuthority("ROLE_BDM") || hasAuthority("ROLE_TOP_MANAGEMENT")) return;
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

        if (projectBriefRepository.findByOpportunityId(opportunityId).isPresent()) {
            throw new IllegalStateException("Project brief already exists for this opportunity");
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

        return mapToDTO(brief);
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

        if (brief.getStatus() != ProjectBriefStatus.DRAFT) {
            throw new ResourceConflictException("Cannot update a submitted project brief directly");
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

        brief = projectBriefRepository.save(brief);
        return mapToDTO(brief);
    }

    @Transactional
    public ProjectBriefDTO saveVersion(UUID briefId, ProjectBriefUpdateDraftRequest request) {
        ProjectBrief briefCheck = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        if (briefCheck.getStatus() != ProjectBriefStatus.DRAFT) {
            throw new ResourceConflictException("Cannot create a new version for a submitted project brief");
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
            String jsonSnapshot = objectMapper.writeValueAsString(snapshotDto);
            version.setSnapshot(jsonSnapshot);
        } catch (Exception e) {
            System.err.println("Failed to serialize snapshot: " + e.getMessage());
        }

        versionRepository.save(version);
        
        return snapshotDto != null ? snapshotDto : mapToDTO(brief);
    }

    @Transactional
    public ProjectBriefDTO submitProjectBrief(UUID briefId, ProjectBriefSubmitRequest request) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Project brief not found"));
        
        validateWriteAccess(brief.getOpportunity());

        if (brief.getStatus() == ProjectBriefStatus.SUBMITTED) {
            throw new ResourceConflictException("Project brief is already submitted");
        }

        validateMandatorySubmissionFields(brief);

        brief.setStatus(ProjectBriefStatus.SUBMITTED);
        brief.setSubmittedAt(OffsetDateTime.now());
        brief.setSubmittedBy(getAuthenticatedUser());
        
        brief.setCurrentVersionNumber(brief.getCurrentVersionNumber() + 1);
        
        brief = projectBriefRepository.save(brief);

        SalesOpportunity opp = brief.getOpportunity();
        opp.setStage(OpportunityStage.BRIEF_SUBMITTED);
        opportunityRepository.save(opp);

        opportunityService.logActivity(opp, "BRIEF_SUBMITTED", "Project Brief submitted");

        ProjectBriefVersion version = new ProjectBriefVersion();
        version.setProjectBrief(brief);
        version.setVersionNumber(brief.getCurrentVersionNumber());
        version.setSubmittedVersion(true);
        version.setCreatedBy(getAuthenticatedUser() != null ? getAuthenticatedUser().getId() : null);
        
        ProjectBriefDTO snapshotDto = null;
        try {
            snapshotDto = mapToDTO(brief);
            String jsonSnapshot = objectMapper.writeValueAsString(snapshotDto);
            version.setSnapshot(jsonSnapshot);
        } catch (Exception e) {
            System.err.println("Failed to serialize snapshot: " + e.getMessage());
        }

        versionRepository.save(version);

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

        if (brief.getStatus() == ProjectBriefStatus.SUBMITTED) {
            throw new ResourceConflictException("Cannot add attachments to a submitted project brief");
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

        if (brief.getStatus() == ProjectBriefStatus.SUBMITTED) {
            throw new ResourceConflictException("Cannot add attachments to a submitted project brief");
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

        if (brief.getStatus() == ProjectBriefStatus.SUBMITTED) {
            throw new ResourceConflictException("Cannot delete attachments from a submitted project brief");
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
