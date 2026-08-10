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

    @Transactional
    public ProjectExecutionAttachmentDTO saveAttachment(ProjectExecutionAttachmentDTO dto, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), userId, authorities);

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
        securityHelper.getWorkspaceAndVerifyWriteAccess(attachment.getWorkspace().getId(), userId, authorities);
        attachmentRepository.delete(attachment);
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
