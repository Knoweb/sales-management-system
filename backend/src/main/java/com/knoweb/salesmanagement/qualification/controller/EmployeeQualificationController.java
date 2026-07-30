package com.knoweb.salesmanagement.qualification.controller;

import com.knoweb.salesmanagement.qualification.dto.EmployeeQualificationDTO;
import com.knoweb.salesmanagement.qualification.dto.EmployeeQualificationRequest;
import com.knoweb.salesmanagement.qualification.service.EmployeeQualificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees/{employeeId}/qualifications")
public class EmployeeQualificationController {

    private final EmployeeQualificationService qualificationService;

    public EmployeeQualificationController(EmployeeQualificationService qualificationService) {
        this.qualificationService = qualificationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('EMPLOYEE_QUALIFICATION_MANAGE')")
    public EmployeeQualificationDTO addQualification(@PathVariable UUID employeeId, @Valid @RequestBody EmployeeQualificationRequest request) {
        return qualificationService.addQualification(employeeId, request);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_QUALIFICATION_READ')")
    public List<EmployeeQualificationDTO> getEmployeeQualifications(@PathVariable UUID employeeId) {
        return qualificationService.getEmployeeQualifications(employeeId);
    }

    @PutMapping("/{qualificationId}")
    @PreAuthorize("hasAuthority('EMPLOYEE_QUALIFICATION_MANAGE')")
    public EmployeeQualificationDTO updateQualification(@PathVariable UUID employeeId,
                                                        @PathVariable UUID qualificationId,
                                                        @Valid @RequestBody EmployeeQualificationRequest request) {
        return qualificationService.updateQualification(employeeId, qualificationId, request);
    }

    @DeleteMapping("/{qualificationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('EMPLOYEE_QUALIFICATION_MANAGE')")
    public void removeQualification(@PathVariable UUID employeeId, @PathVariable UUID qualificationId) {
        qualificationService.removeQualification(employeeId, qualificationId);
    }
}
