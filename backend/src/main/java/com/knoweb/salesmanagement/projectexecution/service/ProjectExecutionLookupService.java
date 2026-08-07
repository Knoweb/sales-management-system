package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectExecutionDepartmentLookupDTO;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectExecutionEmployeeLookupDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProjectExecutionLookupService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public ProjectExecutionLookupService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<ProjectExecutionEmployeeLookupDTO> getEmployeeLookups() {
        return employeeRepository.findAll().stream()
                .filter(e -> e.getEmploymentStatus() == EmploymentStatus.ACTIVE)
                .map(this::mapToEmployeeLookupDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectExecutionEmployeeLookupDTO> getProjectManagerLookups() {
        return employeeRepository.findEligibleProjectManagers().stream()
                .map(this::mapToEmployeeLookupDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectExecutionDepartmentLookupDTO> getDepartmentLookups() {
        return departmentRepository.findAll().stream()
                .map(d -> {
                    ProjectExecutionDepartmentLookupDTO dto = new ProjectExecutionDepartmentLookupDTO();
                    dto.setId(d.getId());
                    dto.setName(d.getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private ProjectExecutionEmployeeLookupDTO mapToEmployeeLookupDTO(Employee e) {
        ProjectExecutionEmployeeLookupDTO dto = new ProjectExecutionEmployeeLookupDTO();
        dto.setEmployeeId(e.getId());
        dto.setEmployeeNumber(e.getEmployeeNumber());
        if (e.getUser() != null) {
            dto.setUserId(e.getUser().getId());
        }
        dto.setFullName(e.getFirstName() + " " + e.getLastName());
        if (e.getDepartment() != null) {
            dto.setDepartmentId(e.getDepartment().getId());
            dto.setDepartmentName(e.getDepartment().getName());
        }
        dto.setActive(e.getEmploymentStatus() == EmploymentStatus.ACTIVE);
        return dto;
    }
}
