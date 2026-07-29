package com.knoweb.salesmanagement.auth.service;

import com.knoweb.salesmanagement.auth.token.RefreshToken;
import com.knoweb.salesmanagement.auth.token.RefreshTokenRepository;
import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshTokenDays;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${jwt.refresh-token-days:${JWT_REFRESH_TOKEN_DAYS:7}}") long refreshTokenDays) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenDays = refreshTokenDays;
    }

    @Transactional
    public String createRefreshToken(User user, String ipAddress, String userAgent) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenIdentifier(UUID.randomUUID());
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setExpiresAt(ZonedDateTime.now().plusDays(refreshTokenDays));
        refreshToken.setCreatedByIp(ipAddress);
        refreshToken.setUserAgent(userAgent);

        refreshTokenRepository.save(refreshToken);

        return refreshToken.getTokenIdentifier().toString() + ":" + rawToken;
    }

    @Transactional
    public String rotateRefreshToken(String tokenString, String ipAddress, String userAgent) {
        String[] parts = tokenString.split(":");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid refresh token format");
        }

        UUID tokenIdentifier;
        try {
            tokenIdentifier = UUID.fromString(parts[0]);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid refresh token identifier");
        }
        
        String rawToken = parts[1];
        String tokenHash = hashToken(rawToken);

        RefreshToken existingToken = refreshTokenRepository.findByTokenIdentifier(tokenIdentifier)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));

        if (!existingToken.getTokenHash().equals(tokenHash)) {
            // Potential token theft/reuse
            refreshTokenRepository.revokeAllUserTokens(existingToken.getUser());
            throw new IllegalArgumentException("Invalid refresh token hash");
        }

        if (existingToken.getRevokedAt() != null) {
            // Attempt to reuse revoked token -> Revoke all family tokens
            refreshTokenRepository.revokeAllUserTokens(existingToken.getUser());
            throw new IllegalArgumentException("Refresh token has been revoked");
        }

        if (existingToken.getExpiresAt().isBefore(ZonedDateTime.now())) {
            throw new IllegalArgumentException("Refresh token has expired");
        }

        // Revoke the old token
        existingToken.setRevokedAt(ZonedDateTime.now());
        
        // Generate new token
        String newRawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String newTokenHash = hashToken(newRawToken);

        RefreshToken newToken = new RefreshToken();
        newToken.setUser(existingToken.getUser());
        newToken.setTokenIdentifier(UUID.randomUUID());
        newToken.setTokenHash(newTokenHash);
        newToken.setExpiresAt(ZonedDateTime.now().plusDays(refreshTokenDays));
        newToken.setCreatedByIp(ipAddress);
        newToken.setUserAgent(userAgent);
        
        existingToken.setReplacedByToken(newToken);
        
        refreshTokenRepository.save(existingToken);
        refreshTokenRepository.save(newToken);

        return newToken.getTokenIdentifier().toString() + ":" + newRawToken;
    }

    @Transactional
    public void revokeToken(String tokenString) {
        if (tokenString == null || !tokenString.contains(":")) {
            return;
        }
        try {
            String[] parts = tokenString.split(":");
            UUID tokenIdentifier = UUID.fromString(parts[0]);
            refreshTokenRepository.findByTokenIdentifier(tokenIdentifier).ifPresent(token -> {
                token.setRevokedAt(ZonedDateTime.now());
                refreshTokenRepository.save(token);
            });
        } catch (Exception e) {
            // Ignore format errors during logout/revocation
        }
    }
    
    @Transactional
    public void revokeAllTokensForUser(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    public User getUserFromToken(String tokenString) {
        String[] parts = tokenString.split(":");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid refresh token format");
        }
        UUID tokenIdentifier = UUID.fromString(parts[0]);
        RefreshToken existingToken = refreshTokenRepository.findByTokenIdentifier(tokenIdentifier)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));
        return existingToken.getUser();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}
