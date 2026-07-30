package com.knoweb.salesmanagement.skill.controller;

import com.knoweb.salesmanagement.skill.dto.AssignEmployeeSkillRequest;
import com.knoweb.salesmanagement.skill.dto.EmployeeSkillDTO;
import com.knoweb.salesmanagement.skill.dto.UpdateEmployeeSkillRequest;
import com.knoweb.salesmanagement.skill.service.EmployeeSkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees/{employeeId}/skills")
public class EmployeeSkillController {

    private final EmployeeSkillService employeeSkillService;

    public EmployeeSkillController(EmployeeSkillService employeeSkillService) {
        this.employeeSkillService = employeeSkillService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOD')")
    public EmployeeSkillDTO assignSkill(@PathVariable UUID employeeId, @Valid @RequestBody AssignEmployeeSkillRequest request) {
        return employeeSkillService.assignSkill(employeeId, request);
    }

    @GetMapping
    public List<EmployeeSkillDTO> getEmployeeSkills(@PathVariable UUID employeeId) {
        return employeeSkillService.getEmployeeSkills(employeeId);
    }

    @PutMapping("/{skillId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOD')")
    public EmployeeSkillDTO updateEmployeeSkill(@PathVariable UUID employeeId,
                                                @PathVariable UUID skillId,
                                                @Valid @RequestBody UpdateEmployeeSkillRequest request) {
        return employeeSkillService.updateEmployeeSkill(employeeId, skillId, request);
    }

    @DeleteMapping("/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOD')")
    public void removeEmployeeSkill(@PathVariable UUID employeeId, @PathVariable UUID skillId) {
        employeeSkillService.removeEmployeeSkill(employeeId, skillId);
    }
}
