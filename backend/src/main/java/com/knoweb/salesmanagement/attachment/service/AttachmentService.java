package com.knoweb.salesmanagement.attachment.service;

import com.knoweb.salesmanagement.attachment.dto.AttachmentDTO;
import com.knoweb.salesmanagement.attachment.entity.Attachment;
import com.knoweb.salesmanagement.attachment.repository.AttachmentRepository;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.context.ApplicationEventPublisher;
import com.knoweb.salesmanagement.attachment.event.AttachmentEvent;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final Path fileStorageLocation;
    private final ApplicationEventPublisher eventPublisher;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             ApplicationEventPublisher eventPublisher,
                             @Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.attachmentRepository = attachmentRepository;
        this.eventPublisher = eventPublisher;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Transactional
    public AttachmentDTO storeFile(UUID entityId, String entityType, MultipartFile file) {
        // Normalize file name and sanitize
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileName = sanitizeFileName(originalFileName);

        try {
            // Check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                throw new IllegalArgumentException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            validateFileType(fileName);

            // Generate unique filename to prevent overwriting
            String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = new Attachment();
            attachment.setEntityId(entityId);
            attachment.setEntityType(entityType);
            attachment.setFileName(fileName);
            attachment.setFileType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setStoragePath(uniqueFileName);

            attachment = attachmentRepository.save(attachment);

            eventPublisher.publishEvent(new AttachmentEvent(this, entityId, entityType, "UPLOADED", fileName));

            return mapToDto(attachment);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(UUID attachmentId) {
        try {
            Attachment attachment = attachmentRepository.findById(attachmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

            Path filePath = this.fileStorageLocation.resolve(attachment.getStoragePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found " + attachment.getStoragePath());
            }
        } catch (Exception ex) {
            throw new ResourceNotFoundException("File not found");
        }
    }

    @Transactional(readOnly = true)
    public AttachmentDTO getAttachment(UUID attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        return mapToDto(attachment);
    }

    @Transactional(readOnly = true)
    public List<AttachmentDTO> getAttachmentsForEntity(UUID entityId, String entityType) {
        return attachmentRepository.findByEntityIdAndEntityType(entityId, entityType)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAttachment(UUID attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        try {
            Path filePath = this.fileStorageLocation.resolve(attachment.getStoragePath()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            // Log warning but continue with DB deletion
        }

        attachmentRepository.delete(attachment);
        eventPublisher.publishEvent(new AttachmentEvent(this, attachment.getEntityId(), attachment.getEntityType(), "REMOVED", attachment.getFileName()));
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
    }

    private void validateFileType(String fileName) {
        String lowerCaseName = fileName.toLowerCase();
        if (!lowerCaseName.endsWith(".pdf") && 
            !lowerCaseName.endsWith(".docx") && 
            !lowerCaseName.endsWith(".jpg") && 
            !lowerCaseName.endsWith(".jpeg") && 
            !lowerCaseName.endsWith(".png")) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, DOCX, JPG, and PNG are allowed.");
        }
    }

    private AttachmentDTO mapToDto(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setEntityId(attachment.getEntityId());
        dto.setEntityType(attachment.getEntityType());
        dto.setFileName(attachment.getFileName());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        dto.setCreatedAt(attachment.getCreatedAt());
        dto.setCreatedBy(attachment.getCreatedBy());
        return dto;
    }
}
