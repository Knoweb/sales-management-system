package com.knoweb.salesmanagement.auth.controller;

import com.knoweb.salesmanagement.auth.dto.AuthResponse;
import com.knoweb.salesmanagement.auth.dto.ChangePasswordRequest;
import com.knoweb.salesmanagement.auth.dto.LoginRequest;
import com.knoweb.salesmanagement.auth.service.AuthService;
import com.knoweb.salesmanagement.user.dto.SafeUserDto;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final boolean secureCookie;

    public AuthController(
            AuthService authService,
            UserRepository userRepository,
            @Value("${auth.cookie.secure:${AUTH_COOKIE_SECURE:false}}") boolean secureCookie) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        try {
            AuthService.LoginResult result = authService.loginWithCookie(request, getClientIp(httpRequest), httpRequest.getHeader(HttpHeaders.USER_AGENT));
            setRefreshCookie(httpResponse, result.refreshToken, (int) (7 * 24 * 60 * 60)); // 7 days
            return ResponseEntity.ok(result.authResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            AuthService.LoginResult result = authService.refreshWithCookie(refreshToken, getClientIp(httpRequest), httpRequest.getHeader(HttpHeaders.USER_AGENT));
            setRefreshCookie(httpResponse, result.refreshToken, (int) (7 * 24 * 60 * 60));
            return ResponseEntity.ok(result.authResponse);
        } catch (Exception e) {
            clearRefreshCookie(httpResponse);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse httpResponse) {
        
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        clearRefreshCookie(httpResponse);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<SafeUserDto> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !user.isActive() || user.isLocked()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(SafeUserDto.fromEntity(user));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletResponse httpResponse) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            authService.changePassword(authentication.getName(), request);
            clearRefreshCookie(httpResponse);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private void setRefreshCookie(HttpServletResponse response, String refreshToken, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/v1/auth")
                .maxAge(maxAgeSeconds)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/v1/auth")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = "";
        if (request != null) {
            remoteAddr = request.getHeader("X-FORWARDED-FOR");
            if (remoteAddr == null || "".equals(remoteAddr)) {
                remoteAddr = request.getRemoteAddr();
            }
        }
        return remoteAddr;
    }
}
