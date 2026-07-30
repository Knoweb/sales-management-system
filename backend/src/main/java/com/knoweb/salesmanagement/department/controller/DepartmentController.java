package com.knoweb.salesmanagement.department.controller;

import com.knoweb.salesmanagement.department.dto.AssignDepartmentHeadRequest;
import com.knoweb.salesmanagement.department.dto.CreateDepartmentRequest;
import com.knoweb.salesmanagement.department.dto.DepartmentDTO;
import com.knoweb.salesmanagement.department.dto.UpdateDepartmentRequest;
import com.knoweb.salesmanagement.department.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public DepartmentDTO createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        return departmentService.createDepartment(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'TOP_MANAGEMENT', 'TECHNICAL_COORDINATOR')")
    public Page<DepartmentDTO> searchDepartments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return departmentService.searchDepartments(search, active, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'TOP_MANAGEMENT', 'TECHNICAL_COORDINATOR') or @departmentAccessService.isDepartmentHeadFor(#id)")
    public DepartmentDTO getDepartment(@PathVariable UUID id) {
        return departmentService.getDepartment(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public DepartmentDTO updateDepartment(@PathVariable UUID id, @Valid @RequestBody UpdateDepartmentRequest request) {
        return departmentService.updateDepartment(id, request);
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public void updateDepartmentStatus(@PathVariable UUID id) {
        departmentService.updateDepartmentStatus(id);
    }

    @PostMapping("/{id}/head")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public void assignDepartmentHead(@PathVariable UUID id, @Valid @RequestBody AssignDepartmentHeadRequest request) {
        departmentService.assignDepartmentHead(id, request);
    }
}
