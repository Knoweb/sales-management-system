package com.knoweb.salesmanagement.role.dto;

import com.knoweb.salesmanagement.role.entity.Role;

public class RoleDto {

    private String code;
    private String name;
    private String description;

    public static RoleDto fromEntity(Role role) {
        RoleDto dto = new RoleDto();
        dto.setCode(role.getCode());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        return dto;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
