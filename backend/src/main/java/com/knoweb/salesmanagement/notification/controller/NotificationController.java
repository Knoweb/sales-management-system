package com.knoweb.salesmanagement.notification.controller;

import com.knoweb.salesmanagement.notification.dto.NotificationDTO;
import com.knoweb.salesmanagement.notification.service.NotificationService;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('NOTIFICATION_SELF_READ')")
    public List<NotificationDTO> getMyNotifications(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return Collections.emptyList();
        return notificationService.getUserNotifications(user.getId());
    }

    @PostMapping("/{id}/read")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('NOTIFICATION_SELF_UPDATE')")
    public void markAsRead(@PathVariable UUID id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null) {
            notificationService.markAsRead(id); // Simple mark as read
        }
    }
}
