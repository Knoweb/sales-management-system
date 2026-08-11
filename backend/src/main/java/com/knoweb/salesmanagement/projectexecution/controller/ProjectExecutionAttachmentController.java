package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectExecutionAttachmentDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectExecutionAttachmentService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/attachments")
public class ProjectExecutionAttachmentController {

    private final ProjectExecutionAttachmentService attachmentService;

    public ProjectExecutionAttachmentController(ProjectExecutionAttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @GetMapping("/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ProjectExecutionAttachmentDTO>> getAttachmentsByWorkspace(
            @PathVariable UUID workspaceId,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(attachmentService.getAttachmentsByWorkspace(workspaceId, type));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectExecutionAttachmentDTO> saveAttachment(
            @Valid @RequestBody ProjectExecutionAttachmentDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(attachmentService.saveAttachment(dto, userDetails.getId(), userDetails.getAuthorities()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        attachmentService.deleteAttachment(id, userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectExecutionAttachmentDTO> uploadAttachment(
            @RequestParam("workspaceId") UUID workspaceId,
            @RequestParam("attachmentType") String attachmentType,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(attachmentService.uploadAttachment(workspaceId, attachmentType, file, description, userDetails.getId(), userDetails.getAuthorities()));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<org.springframework.core.io.Resource> downloadAttachment(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        org.springframework.core.io.Resource resource = attachmentService.downloadAttachmentResource(id, userDetails.getId(), userDetails.getAuthorities());
        ProjectExecutionAttachmentDTO dto = attachmentService.getAttachmentById(id);
        
        org.springframework.http.MediaType mediaType = org.springframework.http.MediaType.APPLICATION_OCTET_STREAM;
        if (dto.getMimeType() != null) {
            try {
                mediaType = org.springframework.http.MediaType.parseMediaType(dto.getMimeType());
            } catch (Exception e) {
                // Ignore parse error and fallback to octet-stream
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + dto.getOriginalFileName() + "\"")
                .body(resource);
    }
}
