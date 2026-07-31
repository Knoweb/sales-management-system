package com.knoweb.salesmanagement.department.service;

import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.department.dto.AssignDepartmentHeadRequest;
import com.knoweb.salesmanagement.department.dto.CreateDepartmentRequest;
import com.knoweb.salesmanagement.department.dto.DepartmentDTO;
import com.knoweb.salesmanagement.department.dto.EmployeeSummaryDTO;
import com.knoweb.salesmanagement.department.dto.UpdateDepartmentRequest;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.entity.DepartmentHead;
import com.knoweb.salesmanagement.department.repository.DepartmentHeadRepository;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentHeadRepository departmentHeadRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentAccessService accessService;

    public DepartmentService(DepartmentRepository departmentRepository,
                             DepartmentHeadRepository departmentHeadRepository,
                             EmployeeRepository employeeRepository,
                             DepartmentAccessService accessService) {
        this.departmentRepository = departmentRepository;
        this.departmentHeadRepository = departmentHeadRepository;
        this.employeeRepository = employeeRepository;
        this.accessService = accessService;
    }

    public DepartmentDTO createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new IllegalStateException("Department code already exists: " + request.getCode());
        }
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalStateException("Department name already exists: " + request.getName());
        }

        Department department = new Department();
        department.setCode(request.getCode().toUpperCase());
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setActive(true);
        department.setSystemSeeded(false);

        User currentUser = accessService.getAuthenticatedUser();
        if (currentUser != null) {
            department.setCreatedBy(currentUser.getId());
            department.setUpdatedBy(currentUser.getId());
        }

        department = departmentRepository.save(department);
        return mapToDTO(department);
    }

    @Transactional(readOnly = true)
    public Page<DepartmentDTO> searchDepartments(String search, Boolean active, Pageable pageable) {
        String safeSearch = search == null ? "" : search;
        return departmentRepository.searchDepartments(safeSearch, active, pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public DepartmentDTO getDepartment(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        return mapToDTO(department);
    }

    public DepartmentDTO updateDepartment(UUID id, UpdateDepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Optional<Department> existing = departmentRepository.findByNameIgnoreCase(request.getName());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new IllegalStateException("Department name already exists: " + request.getName());
        }

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        User currentUser = accessService.getAuthenticatedUser();
        if (currentUser != null) {
            department.setUpdatedBy(currentUser.getId());
        }

        return mapToDTO(departmentRepository.save(department));
    }

    public void updateDepartmentStatus(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (department.isActive()) {
            boolean hasActiveEmployees = employeeRepository.existsByDepartmentIdAndEmploymentStatusNot(id, EmploymentStatus.TERMINATED);
            if (hasActiveEmployees) {
                throw new IllegalStateException("Cannot disable department with active employees");
            }
            department.setActive(false);
        } else {
            department.setActive(true);
        }

        User currentUser = accessService.getAuthenticatedUser();
        if (currentUser != null) {
            department.setUpdatedBy(currentUser.getId());
        }
        departmentRepository.save(department);
    }

    public void assignDepartmentHead(UUID departmentId, AssignDepartmentHeadRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        if (!department.isActive()) {
            throw new IllegalStateException("Cannot assign head to inactive department");
        }

        Employee newHead = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (!newHead.getDepartment().getId().equals(departmentId)) {
            throw new IllegalStateException("Employee does not belong to this department");
        }
        
        if (newHead.getUser() == null || newHead.getUser().getRoles().stream().noneMatch(r -> r.getCode().equals("HOD"))) {
            throw new IllegalStateException("Employee must be linked to a user account with HOD role");
        }

        if (newHead.getEmploymentStatus() != EmploymentStatus.ACTIVE) {
            throw new IllegalStateException("Cannot assign inactive employee as department head");
        }

        Optional<DepartmentHead> currentHead = departmentHeadRepository.findByDepartmentIdAndActiveTrue(departmentId);
        if (currentHead.isPresent()) {
            if (currentHead.get().getEmployee().getId().equals(request.getEmployeeId())) {
                return; // already head
            }
            DepartmentHead old = currentHead.get();
            old.setActive(false);
            old.setEndedAt(OffsetDateTime.now());
            departmentHeadRepository.save(old);
        }

        DepartmentHead newAssignment = new DepartmentHead();
        newAssignment.setDepartment(department);
        newAssignment.setEmployee(newHead);
        
        User currentUser = accessService.getAuthenticatedUser();
        if (currentUser != null) {
            newAssignment.setAssignedBy(currentUser);
        }
        departmentHeadRepository.save(newAssignment);
    }

    private DepartmentDTO mapToDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setCode(department.getCode());
        dto.setName(department.getName());
        dto.setDescription(department.getDescription());
        dto.setActive(department.isActive());
        dto.setSystemSeeded(department.isSystemSeeded());
        dto.setCreatedAt(department.getCreatedAt());
        dto.setUpdatedAt(department.getUpdatedAt());

        Optional<DepartmentHead> activeHead = departmentHeadRepository.findByDepartmentIdAndActiveTrue(department.getId());
        if (activeHead.isPresent()) {
            Employee emp = activeHead.get().getEmployee();
            EmployeeSummaryDTO headDto = new EmployeeSummaryDTO(
                    emp.getId(), emp.getEmployeeNumber(), emp.getFirstName(), emp.getLastName(),
                    emp.getJobTitle(), emp.getWorkEmail()
            );
            dto.setActiveHod(headDto);
        }

        // Populate actual employee count
        long activeCount = employeeRepository.countByDepartmentIdAndEmploymentStatus(department.getId(), EmploymentStatus.ACTIVE);
        dto.setEmployeeCount(activeCount);
        dto.setActiveEmployeeCount(activeCount);
        return dto;
    }
}
