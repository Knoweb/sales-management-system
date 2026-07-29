package com.knoweb.salesmanagement.auth.service;

import com.knoweb.salesmanagement.auth.dto.AuthResponse;
import com.knoweb.salesmanagement.auth.dto.ChangePasswordRequest;
import com.knoweb.salesmanagement.auth.dto.LoginRequest;
import com.knoweb.salesmanagement.security.jwt.JwtTokenProvider;
import com.knoweb.salesmanagement.user.dto.SafeUserDto;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final long accessTokenMinutes;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            RefreshTokenService refreshTokenService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @org.springframework.beans.factory.annotation.Value("${jwt.access-token-minutes:${JWT_ACCESS_TOKEN_MINUTES:15}}") long accessTokenMinutes) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.accessTokenMinutes = accessTokenMinutes;
    }

    @Transactional
    public AuthResponse login(LoginRequest loginRequest, String ipAddress, String userAgent) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail().toLowerCase(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isActive() || user.isLocked()) {
            throw new IllegalArgumentException("User account is disabled or locked");
        }

        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user, ipAddress, userAgent);
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenString, String ipAddress, String userAgent) {
        String newRefreshToken = refreshTokenService.rotateRefreshToken(refreshTokenString, ipAddress, userAgent);
        User user = refreshTokenService.getUserFromToken(newRefreshToken);

        if (!user.isActive() || user.isLocked()) {
            throw new IllegalArgumentException("User account is disabled or locked");
        }

        AuthResponse authResponse = buildAuthResponseInternal(user);
        // We temporarily store the new refresh token in the response so the controller can put it in a cookie.
        // It won't be serialized to the client because it's not a field in AuthResponse, wait...
        // I need a way to pass the new refresh token to the controller.
        // Let's create an internal wrapper or just pass it in a map.
        // Or I can add a transient field or we can just return a Pair. 
        // For simplicity, let's just create a custom DTO `LoginResult` inside AuthService.
        return authResponse;
    }

    public static class LoginResult {
        public final AuthResponse authResponse;
        public final String refreshToken;
        
        public LoginResult(AuthResponse authResponse, String refreshToken) {
            this.authResponse = authResponse;
            this.refreshToken = refreshToken;
        }
    }
    
    @Transactional
    public LoginResult loginWithCookie(LoginRequest loginRequest, String ipAddress, String userAgent) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail().toLowerCase(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive() || user.isLocked()) {
            throw new IllegalArgumentException("User account is disabled or locked");
        }

        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);

        AuthResponse authResponse = buildAuthResponseInternal(user);
        String refreshToken = refreshTokenService.createRefreshToken(user, ipAddress, userAgent);
        
        return new LoginResult(authResponse, refreshToken);
    }

    @Transactional
    public LoginResult refreshWithCookie(String refreshTokenString, String ipAddress, String userAgent) {
        String newRefreshToken = refreshTokenService.rotateRefreshToken(refreshTokenString, ipAddress, userAgent);
        User user = refreshTokenService.getUserFromToken(newRefreshToken);

        if (!user.isActive() || user.isLocked()) {
            throw new IllegalArgumentException("User account is disabled or locked");
        }

        AuthResponse authResponse = buildAuthResponseInternal(user);
        return new LoginResult(authResponse, newRefreshToken);
    }

    @Transactional
    public void logout(String refreshTokenString) {
        refreshTokenService.revokeToken(refreshTokenString);
        SecurityContextHolder.clearContext();
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid current password");
        }
        
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password cannot be the same as current password");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangeRequired(false);
        userRepository.save(user);

        // Revoke all tokens on password change
        refreshTokenService.revokeAllTokensForUser(user);
    }

    private AuthResponse buildAuthResponse(User user, String ipAddress, String userAgent) {
        return buildAuthResponseInternal(user);
    }

    private AuthResponse buildAuthResponseInternal(User user) {
        List<String> roles = user.getRoles().stream()
                .map(r -> r.getCode())
                .collect(Collectors.toList());
        List<String> permissions = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(p -> p.getCode())
                .distinct()
                .collect(Collectors.toList());

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), roles, permissions);

        SafeUserDto userDto = SafeUserDto.fromEntity(user);

        return new AuthResponse(accessToken, accessTokenMinutes * 60, userDto);
    }
}
