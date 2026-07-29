package com.knoweb.salesmanagement.auth.token;

import com.knoweb.salesmanagement.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;

    @Column(name = "token_identifier", nullable = false, unique = true)
    private UUID tokenIdentifier;

    @Column(name = "issued_at", nullable = false, updatable = false)
    private ZonedDateTime issuedAt = ZonedDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private ZonedDateTime expiresAt;

    @Column(name = "revoked_at")
    private ZonedDateTime revokedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replaced_by_token_id")
    private RefreshToken replacedByToken;

    @Column(name = "created_by_ip", length = 45)
    private String createdByIp;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public UUID getTokenIdentifier() { return tokenIdentifier; }
    public void setTokenIdentifier(UUID tokenIdentifier) { this.tokenIdentifier = tokenIdentifier; }
    public ZonedDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(ZonedDateTime issuedAt) { this.issuedAt = issuedAt; }
    public ZonedDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(ZonedDateTime expiresAt) { this.expiresAt = expiresAt; }
    public ZonedDateTime getRevokedAt() { return revokedAt; }
    public void setRevokedAt(ZonedDateTime revokedAt) { this.revokedAt = revokedAt; }
    public RefreshToken getReplacedByToken() { return replacedByToken; }
    public void setReplacedByToken(RefreshToken replacedByToken) { this.replacedByToken = replacedByToken; }
    public String getCreatedByIp() { return createdByIp; }
    public void setCreatedByIp(String createdByIp) { this.createdByIp = createdByIp; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
}
