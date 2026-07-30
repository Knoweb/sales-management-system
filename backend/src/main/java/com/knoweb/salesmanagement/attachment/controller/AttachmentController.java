package com.knoweb.salesmanagement.attachment.controller;

import com.knoweb.salesmanagement.attachment.dto.AttachmentDTO;
import com.knoweb.salesmanagement.attachment.service.AttachmentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ATTACHMENT_MANAGE')")
    public ResponseEntity<AttachmentDTO> uploadFile(
            @RequestParam("entityId") UUID entityId,
            @RequestParam("entityType") String entityType,
            @RequestParam("file") MultipartFile file) {
        
        AttachmentDTO attachment = attachmentService.storeFile(entityId, entityType, file);
        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAuthority('CLIENT_READ') or hasAuthority('LEAD_READ')")
    public ResponseEntity<List<AttachmentDTO>> getAttachments(
            @PathVariable String entityType,
            @PathVariable UUID entityId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsForEntity(entityId, entityType));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAuthority('CLIENT_READ') or hasAuthority('LEAD_READ')")
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID id) {
        Resource resource = attachmentService.loadFileAsResource(id);
        AttachmentDTO attachment = attachmentService.getAttachment(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ATTACHMENT_MANAGE')")
    public ResponseEntity<Void> deleteAttachment(@PathVariable UUID id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }
}
