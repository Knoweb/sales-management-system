package com.knoweb.salesmanagement.projectbrief.controller;

import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefAttachmentDTO;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefAttachmentRequest;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefDTO;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefSubmitRequest;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefUpdateDraftRequest;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefVersionDTO;
import com.knoweb.salesmanagement.projectbrief.service.ProjectBriefService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-briefs")
public class ProjectBriefManagementController {

    private final ProjectBriefService projectBriefService;

    public ProjectBriefManagementController(ProjectBriefService projectBriefService) {
        this.projectBriefService = projectBriefService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_READ')")
    public ProjectBriefDTO getProjectBrief(@PathVariable UUID id) {
        return projectBriefService.getProjectBrief(id);
    }

    @PutMapping("/{id}/draft")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_UPDATE')")
    public ProjectBriefDTO updateDraft(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectBriefUpdateDraftRequest request) {
        return projectBriefService.updateDraft(id, request);
    }

    @PostMapping("/{id}/version")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_UPDATE')")
    public ProjectBriefDTO saveVersion(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectBriefUpdateDraftRequest request) {
        return projectBriefService.saveVersion(id, request);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_SUBMIT')")
    public ProjectBriefDTO submitProjectBrief(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectBriefSubmitRequest request) {
        return projectBriefService.submitProjectBrief(id, request);
    }

    @GetMapping("/{id}/versions")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_READ')")
    public List<ProjectBriefVersionDTO> getProjectBriefVersions(@PathVariable UUID id) {
        return projectBriefService.getProjectBriefVersions(id);
    }

    @GetMapping("/{id}/versions/{versionNumber}")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_READ')")
    public ProjectBriefVersionDTO getProjectBriefVersion(@PathVariable UUID id, @PathVariable Integer versionNumber) {
        return projectBriefService.getProjectBriefVersion(id, versionNumber);
    }

    @PostMapping("/{id}/attachments")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_ATTACHMENT_MANAGE')")
    public ProjectBriefAttachmentDTO addAttachment(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectBriefAttachmentRequest request) {
        return projectBriefService.addAttachment(id, request);
    }

    @PostMapping(value = "/{id}/attachments/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_ATTACHMENT_MANAGE')")
    public ProjectBriefAttachmentDTO uploadAttachment(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return projectBriefService.uploadAttachment(id, file);
    }

    @GetMapping("/{id}/attachments")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_READ')")
    public List<ProjectBriefAttachmentDTO> getAttachments(@PathVariable UUID id) {
        return projectBriefService.getAttachments(id);
    }

    @GetMapping("/{id}/attachments/{attachmentId}/download")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_READ')")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadAttachment(
            @PathVariable UUID id,
            @PathVariable UUID attachmentId) {
        org.springframework.core.io.Resource resource = projectBriefService.downloadAttachmentResource(id, attachmentId);
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_ATTACHMENT_MANAGE')")
    public org.springframework.http.ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID id,
            @PathVariable UUID attachmentId) {
        projectBriefService.deleteAttachment(id, attachmentId);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
