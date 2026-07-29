package com.knoweb.salesmanagement.user.controller;

import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import com.knoweb.salesmanagement.user.dto.CreateUserRequest;
import com.knoweb.salesmanagement.user.dto.ResetPasswordRequest;
import com.knoweb.salesmanagement.user.dto.SafeUserDto;
import com.knoweb.salesmanagement.user.dto.UpdateUserRequest;
import com.knoweb.salesmanagement.user.dto.UpdateUserRolesRequest;
import com.knoweb.salesmanagement.user.dto.UpdateUserStatusRequest;
import com.knoweb.salesmanagement.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public com.knoweb.salesmanagement.common.dto.PaginatedResponse<SafeUserDto> searchUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String roleCode,
            Pageable pageable) {
        return userService.searchUsers(search, active, roleCode, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public SafeUserDto getUser(@PathVariable UUID id) {
        return userService.getUser(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<SafeUserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        SafeUserDto created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public SafeUserDto updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_DISABLE')")
    public void updateUserStatus(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.updateUserStatus(id, request, currentUser.getId());
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('USER_ROLE_ASSIGN')")
    public void updateUserRoles(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateUserRolesRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        userService.updateUserRoles(id, request, currentUser.getId());
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public void resetPassword(@PathVariable UUID id, @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(id, request);
    }
}
