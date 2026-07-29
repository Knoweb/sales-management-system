package com.knoweb.salesmanagement.user.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class UpdateUserRolesRequest {

    @NotEmpty
    private List<String> roleCodes;

    public List<String> getRoleCodes() { return roleCodes; }
    public void setRoleCodes(List<String> roleCodes) { this.roleCodes = roleCodes; }
}
