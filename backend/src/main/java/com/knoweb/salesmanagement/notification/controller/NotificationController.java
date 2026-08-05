package com.knoweb.salesmanagement.notification.controller;

import com.knoweb.salesmanagement.notification.dto.NotificationDTO;
import com.knoweb.salesmanagement.notification.service.NotificationService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private UUID getUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getId();
        }
        throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException("Not authenticated");
    }

    @GetMapping
    @PreAuthorize("hasAuthority('NOTIFICATION_SELF_READ')")
    public Page<NotificationDTO> getMyNotifications(
            @RequestParam(required = false) Boolean isRead,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        
        UUID userId = getUserId(authentication);
        return notificationService.getUserNotifications(userId, isRead, pageable);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAuthority('NOTIFICATION_SELF_READ')")
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        UUID userId = getUserId(authentication);
        long count = notificationService.getUnreadCount(userId);
        return Map.of("count", count);
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAuthority('NOTIFICATION_SELF_UPDATE')")
    public void markAsRead(@PathVariable UUID id, Authentication authentication) {
        UUID userId = getUserId(authentication);
        notificationService.markAsRead(userId, id);
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasAuthority('NOTIFICATION_SELF_UPDATE')")
    public void markAllAsRead(Authentication authentication) {
        UUID userId = getUserId(authentication);
        notificationService.markAllAsRead(userId);
    }
}
