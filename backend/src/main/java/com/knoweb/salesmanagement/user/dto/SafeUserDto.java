package com.knoweb.salesmanagement.user.dto;

import com.knoweb.salesmanagement.role.entity.Permission;
import com.knoweb.salesmanagement.role.entity.Role;
import com.knoweb.salesmanagement.user.entity.User;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class SafeUserDto {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean active;
    private boolean passwordChangeRequired;
    private List<String> roles;
    private List<String> permissions;

    public static SafeUserDto fromEntity(User user) {
        SafeUserDto dto = new SafeUserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setActive(user.isActive());
        dto.setPasswordChangeRequired(user.isPasswordChangeRequired());
        dto.setRoles(user.getRoles().stream().map(Role::getCode).collect(Collectors.toList()));
        dto.setPermissions(user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getCode)
                .distinct()
                .collect(Collectors.toList()));
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isPasswordChangeRequired() { return passwordChangeRequired; }
    public void setPasswordChangeRequired(boolean passwordChangeRequired) { this.passwordChangeRequired = passwordChangeRequired; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }
}
