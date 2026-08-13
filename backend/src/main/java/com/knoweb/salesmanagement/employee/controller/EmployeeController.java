package com.knoweb.salesmanagement.employee.controller;

import com.knoweb.salesmanagement.employee.dto.CreateEmployeeRequest;
import com.knoweb.salesmanagement.employee.dto.CreateSystemLoginRequest;
import com.knoweb.salesmanagement.employee.dto.EmployeeDTO;
import com.knoweb.salesmanagement.employee.dto.LinkUserRequest;
import com.knoweb.salesmanagement.employee.dto.UpdateEmployeeRequest;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    public EmployeeDTO createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @GetMapping("/me")
    public com.knoweb.salesmanagement.employee.dto.EmployeeProfileResponse getMyProfile() {
        return employeeService.getMyProfile();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_READ')")
    public Page<EmployeeDTO> searchEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) EmploymentStatus employmentStatus,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) UUID skillId,
            org.springframework.data.domain.Pageable pageable) {
        return employeeService.searchEmployees(search, departmentId, employmentStatus, employmentType, skillId, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_READ') or hasAuthority('EMPLOYEE_SELF_READ')")
    public EmployeeDTO getEmployee(@PathVariable UUID id) {
        // Authorization handled in service
        return employeeService.getEmployee(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public EmployeeDTO updateEmployee(@PathVariable UUID id, @Valid @RequestBody UpdateEmployeeRequest request) {
        // Authorization handled in service
        return employeeService.updateEmployee(id, request);
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('EMPLOYEE_DISABLE')")
    public void updateEmployeeStatus(@PathVariable UUID id, @RequestParam EmploymentStatus status) {
        employeeService.updateEmployeeStatus(id, status);
    }

    @PostMapping("/{id}/user-link")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('EMPLOYEE_USER_LINK')")
    public void linkUser(@PathVariable UUID id, @Valid @RequestBody LinkUserRequest request) {
        employeeService.linkUser(id, request);
    }

    @DeleteMapping("/{id}/user-link")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('EMPLOYEE_USER_LINK')")
    public void unlinkUser(@PathVariable UUID id) {
        employeeService.unlinkUser(id);
    }

    @PostMapping("/{id}/system-login")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    public EmployeeDTO createSystemLoginForEmployee(@PathVariable UUID id, @Valid @RequestBody CreateSystemLoginRequest request) {
        return employeeService.createSystemLoginForEmployee(id, request);
    }
}
