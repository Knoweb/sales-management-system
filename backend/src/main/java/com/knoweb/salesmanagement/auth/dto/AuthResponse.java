package com.knoweb.salesmanagement.auth.dto;

import com.knoweb.salesmanagement.user.dto.SafeUserDto;

public class AuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    private SafeUserDto user;

    public AuthResponse(String accessToken, long expiresIn, SafeUserDto user) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
    public SafeUserDto getUser() { return user; }
    public void setUser(SafeUserDto user) { this.user = user; }
}
