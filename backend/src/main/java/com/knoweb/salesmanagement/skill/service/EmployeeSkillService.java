package com.knoweb.salesmanagement.skill.service;

import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.department.service.DepartmentAccessService;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.skill.dto.AssignEmployeeSkillRequest;
import com.knoweb.salesmanagement.skill.dto.EmployeeSkillDTO;
import com.knoweb.salesmanagement.skill.dto.UpdateEmployeeSkillRequest;
import com.knoweb.salesmanagement.skill.entity.EmployeeSkill;
import com.knoweb.salesmanagement.skill.entity.Skill;
import com.knoweb.salesmanagement.skill.repository.EmployeeSkillRepository;
import com.knoweb.salesmanagement.skill.repository.SkillRepository;
import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeSkillService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final SkillService skillService;
    private final DepartmentAccessService accessService;

    public EmployeeSkillService(EmployeeSkillRepository employeeSkillRepository,
                                EmployeeRepository employeeRepository,
                                SkillRepository skillRepository,
                                SkillService skillService,
                                DepartmentAccessService accessService) {
        this.employeeSkillRepository = employeeSkillRepository;
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
        this.skillService = skillService;
        this.accessService = accessService;
    }

    public EmployeeSkillDTO assignSkill(UUID employeeId, AssignEmployeeSkillRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        UUID departmentId = employee.getDepartment() != null ? employee.getDepartment().getId() : null;
        accessService.validateEmployeeAccess(employee.getId(), departmentId);

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));

        if (!skill.isActive()) {
            throw new IllegalStateException("Cannot assign inactive skill to employee");
        }

        if (employeeSkillRepository.existsByEmployeeIdAndSkillId(employeeId, request.getSkillId())) {
            throw new IllegalStateException("Employee already has this skill");
        }

        EmployeeSkill employeeSkill = new EmployeeSkill();
        employeeSkill.setEmployee(employee);
        employeeSkill.setSkill(skill);
        employeeSkill.setProficiencyLevel(request.getProficiencyLevel());
        employeeSkill.setYearsOfExperience(request.getYearsOfExperience());
        employeeSkill.setNotes(request.getNotes());
        
        if (Boolean.TRUE.equals(request.getVerified()) && (accessService.hasGlobalAccess() || (departmentId != null && accessService.isDepartmentHeadFor(departmentId)))) {
            employeeSkill.setVerified(true);
            employeeSkill.setVerifiedAt(OffsetDateTime.now());
        } else {
            employeeSkill.setVerified(false);
        }

        return mapToDTO(employeeSkillRepository.save(employeeSkill));
    }

    @Transactional(readOnly = true)
    public List<EmployeeSkillDTO> getEmployeeSkills(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        UUID departmentId = employee.getDepartment() != null ? employee.getDepartment().getId() : null;
        accessService.validateEmployeeAccess(employee.getId(), departmentId);

        return employeeSkillRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeSkillDTO updateEmployeeSkill(UUID employeeId, UUID skillId, UpdateEmployeeSkillRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        UUID departmentId = employee.getDepartment() != null ? employee.getDepartment().getId() : null;
        accessService.validateEmployeeAccess(employee.getId(), departmentId);

        EmployeeSkill employeeSkill = employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill record not found"));

        employeeSkill.setProficiencyLevel(request.getProficiencyLevel());
        employeeSkill.setYearsOfExperience(request.getYearsOfExperience());
        employeeSkill.setNotes(request.getNotes());

        if (Boolean.TRUE.equals(request.getVerified()) && !employeeSkill.isVerified() && (accessService.hasGlobalAccess() || (departmentId != null && accessService.isDepartmentHeadFor(departmentId)))) {
            employeeSkill.setVerified(true);
            employeeSkill.setVerifiedAt(OffsetDateTime.now());
        } else if (Boolean.FALSE.equals(request.getVerified())) {
            employeeSkill.setVerified(false);
            employeeSkill.setVerifiedAt(null);
        }

        return mapToDTO(employeeSkillRepository.save(employeeSkill));
    }

    public void removeEmployeeSkill(UUID employeeId, UUID skillId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        UUID departmentId = employee.getDepartment() != null ? employee.getDepartment().getId() : null;
        accessService.validateEmployeeAccess(employee.getId(), departmentId);

        EmployeeSkill employeeSkill = employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill record not found"));

        employeeSkillRepository.delete(employeeSkill);
    }

    private EmployeeSkillDTO mapToDTO(EmployeeSkill employeeSkill) {
        EmployeeSkillDTO dto = new EmployeeSkillDTO();
        dto.setId(employeeSkill.getId());
        dto.setSkill(skillService.mapToDTO(employeeSkill.getSkill()));
        dto.setProficiencyLevel(employeeSkill.getProficiencyLevel());
        dto.setYearsOfExperience(employeeSkill.getYearsOfExperience());
        dto.setNotes(employeeSkill.getNotes());
        dto.setVerified(employeeSkill.isVerified());
        dto.setVerifiedAt(employeeSkill.getVerifiedAt());
        dto.setCreatedAt(employeeSkill.getCreatedAt());
        return dto;
    }
}
