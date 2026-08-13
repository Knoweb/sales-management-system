package com.knoweb.salesmanagement.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class CreateSystemLoginRequest {
    
    @NotBlank(message = "Login email is required")
    @Email(message = "Invalid login email format")
    private String loginEmail;
    
    @NotBlank(message = "Password is required")
    private String temporaryPassword;
    
    @NotEmpty(message = "At least one role is required")
    private List<String> roleCodes;

    private Boolean active = true;

    public String getLoginEmail() {
        return loginEmail;
    }

    public void setLoginEmail(String loginEmail) {
        this.loginEmail = loginEmail;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }

    public List<String> getRoleCodes() {
        return roleCodes;
    }

    public void setRoleCodes(List<String> roleCodes) {
        this.roleCodes = roleCodes;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
