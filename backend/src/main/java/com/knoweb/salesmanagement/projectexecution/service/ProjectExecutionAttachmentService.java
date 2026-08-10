package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectExecutionAttachmentDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionAttachment;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionAttachmentRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectExecutionAttachmentService {

    private final ProjectExecutionAttachmentRepository attachmentRepository;
    private final ProjectTaskRepository taskRepository;
    private final ProjectExecutionSecurityHelper securityHelper;

    public ProjectExecutionAttachmentService(ProjectExecutionAttachmentRepository attachmentRepository, ProjectTaskRepository taskRepository, ProjectExecutionSecurityHelper securityHelper) {
        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.securityHelper = securityHelper;
    }

    @Transactional(readOnly = true)
    public List<ProjectExecutionAttachmentDTO> getAttachmentsByWorkspace(UUID workspaceId, String type) {
        return attachmentRepository.findAll().stream()
                .filter(a -> a.getWorkspace().getId().equals(workspaceId))
                .filter(a -> type == null || a.getAttachmentType().equalsIgnoreCase(type))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectExecutionAttachmentDTO getAttachmentById(UUID id) {
        return attachmentRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    @Transactional
    public ProjectExecutionAttachmentDTO saveAttachment(ProjectExecutionAttachmentDTO dto, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), userId, authorities);

        if (workspace.getStatus() == com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot upload documents for a CLOSED project workspace.");
        }

        if ("FINAL_DOCUMENT".equals(dto.getAttachmentType())) {
            if (!Boolean.TRUE.equals(workspace.getClientAccepted()) || workspace.getClientAcceptanceDate() == null) {
                throw new IllegalArgumentException("Final documents can only be uploaded after Client Acceptance is completed and recorded.");
            }
        }

        ProjectExecutionAttachment attachment = new ProjectExecutionAttachment();
        attachment.setWorkspace(workspace);
        
        if (dto.getTaskId() != null) {
            ProjectTask task = taskRepository.findById(dto.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            attachment.setTask(task);
        }
        
        attachment.setAttachmentType(dto.getAttachmentType());
        attachment.setOriginalFileName(dto.getOriginalFileName());
        attachment.setStorageReference(dto.getStorageReference());
        attachment.setMimeType(dto.getMimeType());
        attachment.setFileSize(dto.getFileSize());
        attachment.setDescription(dto.getDescription());
        attachment.setUploadedBy(userId);
        attachment.setUploadedAt(OffsetDateTime.now());
        
        return mapToDTO(attachmentRepository.save(attachment));
    }
    
    @Transactional
    public void deleteAttachment(UUID id, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionAttachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(attachment.getWorkspace().getId(), userId, authorities);
        
        if (workspace.getStatus() == com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot delete documents from a CLOSED project workspace.");
        }
        
        // Delete the physical file first
        if (attachment.getStorageReference() != null) {
            try {
                java.nio.file.Path storageDir = java.nio.file.Paths.get("./uploads/project-execution").toAbsolutePath().normalize();
                java.nio.file.Path filePath = storageDir.resolve(attachment.getStorageReference()).normalize();
                java.nio.file.Files.deleteIfExists(filePath);
            } catch (java.io.IOException ex) {
                // Log warning, but don't fail the DB deletion if file is already gone
                System.err.println("Failed to delete physical file: " + attachment.getStorageReference() + " - " + ex.getMessage());
            }
        }
        
        attachmentRepository.delete(attachment);
    }
    
    @Transactional
    public ProjectExecutionAttachmentDTO uploadAttachment(UUID workspaceId, String attachmentType, org.springframework.web.multipart.MultipartFile file, String description, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(workspaceId, userId, authorities);

        if (workspace.getStatus() == com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot upload documents for a CLOSED project workspace.");
        }

        if ("FINAL_DOCUMENT".equals(attachmentType)) {
            if (!Boolean.TRUE.equals(workspace.getClientAccepted()) || workspace.getClientAcceptanceDate() == null) {
                throw new IllegalArgumentException("Final documents can only be uploaded after Client Acceptance is completed and recorded.");
            }
        }

        try {
            java.nio.file.Path storageDir = java.nio.file.Paths.get("./uploads/project-execution").toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(storageDir);
            String fileName = UUID.randomUUID().toString() + "_" + org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
            java.nio.file.Path targetLocation = storageDir.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            ProjectExecutionAttachment attachment = new ProjectExecutionAttachment();
            attachment.setWorkspace(workspace);
            attachment.setAttachmentType(attachmentType);
            attachment.setOriginalFileName(file.getOriginalFilename());
            attachment.setStorageReference(fileName);
            attachment.setMimeType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setDescription(description);
            attachment.setUploadedBy(userId);
            attachment.setUploadedAt(OffsetDateTime.now());

            return mapToDTO(attachmentRepository.save(attachment));
        } catch (java.io.IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource downloadAttachmentResource(UUID attachmentId, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Attachment not found"));
        
        // Ensure user has at least read access to the workspace
        ProjectExecutionWorkspace workspace = attachment.getWorkspace();
        boolean hasAccess = authorities.stream().anyMatch(a -> a.getAuthority().equals("PROJECT_EXECUTION_READ") || a.getAuthority().equals("PROJECT_EXECUTION_WRITE"));
        if (!hasAccess) {
            throw new org.springframework.security.access.AccessDeniedException("No access to read this project workspace.");
        }
        
        try {
            java.nio.file.Path storageDir = java.nio.file.Paths.get("./uploads/project-execution").toAbsolutePath().normalize();
            if (attachment.getStorageReference() == null || attachment.getStorageReference().contains("mock-url")) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "The actual file was not persisted (Mock record).");
            }
            
            java.nio.file.Path filePath = storageDir.resolve(attachment.getStorageReference()).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Could not read file: " + attachment.getStorageReference());
            }
        } catch (java.net.MalformedURLException ex) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Could not read file: " + attachment.getStorageReference(), ex);
        }
    }

    private ProjectExecutionAttachmentDTO mapToDTO(ProjectExecutionAttachment attachment) {
        ProjectExecutionAttachmentDTO dto = new ProjectExecutionAttachmentDTO();
        dto.setId(attachment.getId());
        dto.setWorkspaceId(attachment.getWorkspace().getId());
        if (attachment.getTask() != null) {
            dto.setTaskId(attachment.getTask().getId());
        }
        dto.setAttachmentType(attachment.getAttachmentType());
        dto.setOriginalFileName(attachment.getOriginalFileName());
        dto.setStorageReference(attachment.getStorageReference());
        dto.setMimeType(attachment.getMimeType());
        dto.setFileSize(attachment.getFileSize());
        dto.setDescription(attachment.getDescription());
        dto.setUploadedBy(attachment.getUploadedBy());
        dto.setUploadedAt(attachment.getUploadedAt());
        return dto;
    }
}
