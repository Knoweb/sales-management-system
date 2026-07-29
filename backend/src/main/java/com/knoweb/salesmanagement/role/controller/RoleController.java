package com.knoweb.salesmanagement.role.controller;

import com.knoweb.salesmanagement.role.dto.RoleDto;
import com.knoweb.salesmanagement.role.repository.RoleRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public List<RoleDto> getRoles() {
        return roleRepository.findAll().stream()
                .map(RoleDto::fromEntity)
                .collect(Collectors.toList());
    }
}
