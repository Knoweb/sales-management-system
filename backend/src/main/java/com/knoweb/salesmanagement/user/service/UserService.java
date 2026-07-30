package com.knoweb.salesmanagement.user.service;

import com.knoweb.salesmanagement.auth.service.RefreshTokenService;
import com.knoweb.salesmanagement.role.entity.Role;
import com.knoweb.salesmanagement.role.repository.RoleRepository;
import com.knoweb.salesmanagement.user.dto.CreateUserRequest;
import com.knoweb.salesmanagement.user.dto.ResetPasswordRequest;
import com.knoweb.salesmanagement.user.dto.SafeUserDto;
import com.knoweb.salesmanagement.user.dto.UpdateUserRequest;
import com.knoweb.salesmanagement.user.dto.UpdateUserRolesRequest;
import com.knoweb.salesmanagement.user.dto.UpdateUserStatusRequest;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional(readOnly = true)
    public Page<SafeUserDto> searchUsers(String search, Boolean active, String roleCode, Pageable pageable) {
        Page<SafeUserDto> page = userRepository.searchUsers(search, active, roleCode, pageable)
                .map(SafeUserDto::fromEntity);
        return page;
    }

    @Transactional(readOnly = true)
    public SafeUserDto getUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return SafeUserDto.fromEntity(user);
    }

    @Transactional
    public SafeUserDto createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail().toLowerCase()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getTemporaryPassword()));
        user.setActive(request.isActive());
        user.setPasswordChangeRequired(true);

        Set<Role> roles = new HashSet<>();
        for (String code : request.getRoleCodes()) {
            Role role = roleRepository.findByCode(code)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid role code: " + code));
            roles.add(role);
        }
        user.setRoles(roles);

        user = userRepository.save(user);
        return SafeUserDto.fromEntity(user);
    }

    @Transactional
    public SafeUserDto updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.findByEmail(request.getEmail().toLowerCase()).isPresent()) {
                throw new IllegalArgumentException("Email is already registered by another user");
            }
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        
        user = userRepository.save(user);
        return SafeUserDto.fromEntity(user);
    }

    @Transactional
    public void updateUserStatus(UUID id, UpdateUserStatusRequest request, UUID currentUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getId().equals(currentUserId) && !request.isActive()) {
            throw new IllegalArgumentException("Cannot disable your own account");
        }

        if (!request.isActive()) {
            // Check if this is the last active SYSTEM_ADMIN
            boolean isSystemAdmin = user.getRoles().stream().anyMatch(r -> "SYSTEM_ADMIN".equals(r.getCode()));
            if (isSystemAdmin) {
                long activeAdminCount = userRepository.countActiveSystemAdmins();
                if (activeAdminCount <= 1) {
                    throw new IllegalArgumentException("Cannot disable the last active System Administrator");
                }
            }
            // Revoke tokens
            refreshTokenService.revokeAllTokensForUser(user);
        }

        user.setActive(request.isActive());
        userRepository.save(user);
    }

    @Transactional
    public void updateUserRoles(UUID id, UpdateUserRolesRequest request, UUID currentUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean currentlySystemAdmin = user.getRoles().stream().anyMatch(r -> "SYSTEM_ADMIN".equals(r.getCode()));
        boolean willBeSystemAdmin = request.getRoleCodes().contains("SYSTEM_ADMIN");

        if (currentlySystemAdmin && !willBeSystemAdmin) {
            if (user.getId().equals(currentUserId)) {
                throw new IllegalArgumentException("Cannot remove your own System Administrator role");
            }
            
            if (user.isActive()) {
                long activeAdminCount = userRepository.countActiveSystemAdmins();
                if (activeAdminCount <= 1) {
                    throw new IllegalArgumentException("Cannot remove the System Administrator role from the last active admin");
                }
            }
        }

        Set<Role> roles = new HashSet<>();
        for (String code : request.getRoleCodes()) {
            Role role = roleRepository.findByCode(code)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid role code: " + code));
            roles.add(role);
        }
        
        user.setRoles(roles);
        userRepository.save(user);
        
        // Revoke tokens to force new token with updated roles
        refreshTokenService.revokeAllTokensForUser(user);
    }

    @Transactional
    public void resetPassword(UUID id, ResetPasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getTemporaryPassword()));
        user.setPasswordChangeRequired(true);
        userRepository.save(user);

        refreshTokenService.revokeAllTokensForUser(user);
    }
}
