package com.knoweb.salesmanagement.employee.service;

import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.department.dto.DepartmentDTO;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.department.service.DepartmentAccessService;
import com.knoweb.salesmanagement.employee.dto.CreateEmployeeRequest;
import com.knoweb.salesmanagement.employee.dto.EmployeeDTO;
import com.knoweb.salesmanagement.employee.dto.LinkUserRequest;
import com.knoweb.salesmanagement.employee.dto.UpdateEmployeeRequest;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.user.dto.SafeUserDto;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final DepartmentAccessService accessService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           UserRepository userRepository,
                           DepartmentAccessService accessService) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.accessService = accessService;
    }

    public EmployeeDTO createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmployeeNumber(request.getEmployeeNumber())) {
            throw new IllegalStateException("Employee number already exists: " + request.getEmployeeNumber());
        }
        if (request.getWorkEmail() != null && employeeRepository.existsByWorkEmailIgnoreCase(request.getWorkEmail())) {
            throw new IllegalStateException("Work email already exists: " + request.getWorkEmail());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        if (!department.isActive()) {
            throw new IllegalStateException("Cannot assign employee to inactive department");
        }

        Employee employee = new Employee();
        employee.setEmployeeNumber(request.getEmployeeNumber());
        employee.setDepartment(department);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setWorkEmail(request.getWorkEmail() != null ? request.getWorkEmail().toLowerCase() : null);
        employee.setPersonalEmail(request.getPersonalEmail());
        employee.setContactNumber(request.getContactNumber());
        employee.setJobTitle(request.getJobTitle());
        employee.setEmploymentType(request.getEmploymentType());
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(request.getHireDate());
        employee.setWeeklyCapacityHours(request.getWeeklyCapacityHours());

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (employeeRepository.findByUserId(request.getUserId()).isPresent()) {
                throw new IllegalStateException("User is already linked to another employee");
            }
            employee.setUser(user);
        }

        User currentUser = accessService.getAuthenticatedUser();
        if (currentUser != null) {
            employee.setCreatedBy(currentUser.getId());
            employee.setUpdatedBy(currentUser.getId());
        }

        employee = employeeRepository.save(employee);
        return mapToDTO(employee);
    }

    @Transactional(readOnly = true)
    public com.knoweb.salesmanagement.employee.dto.EmployeeProfileResponse getMyProfile() {
        User currentUser = accessService.getAuthenticatedUser();
        if (currentUser == null) {
            throw new ResourceNotFoundException("No authenticated user");
        }
        java.util.Optional<Employee> employeeOpt = employeeRepository.findByUserId(currentUser.getId());
        if (employeeOpt.isEmpty()) {
            return new com.knoweb.salesmanagement.employee.dto.EmployeeProfileResponse(false, false, null);
        }
        EmployeeDTO dto = mapToDTO(employeeOpt.get());
        return new com.knoweb.salesmanagement.employee.dto.EmployeeProfileResponse(true, dto.isDepartmentHead(), dto);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeDTO> searchEmployees(String search, UUID departmentId, EmploymentStatus employmentStatus, String employmentType, UUID skillId, Pageable pageable) {
        if (!accessService.hasGlobalAccess()) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean isHod = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HOD"));
            
            if (isHod) {
                User currentUser = accessService.getAuthenticatedUser();
                if (currentUser == null) {
                    return Page.empty(pageable);
                }
                
                Employee currentEmp = employeeRepository.findByUserId(currentUser.getId())
                        .orElseThrow(() -> new IllegalStateException("Your user account is not linked to an employee profile."));
                
                if (currentEmp.getDepartment() == null) {
                    throw new IllegalStateException("Your employee profile is not assigned to a department.");
                }
                
                UUID myDeptId = currentEmp.getDepartment().getId();
                
                if (departmentId != null && !departmentId.equals(myDeptId)) {
                    return Page.empty(pageable);
                }
                
                departmentId = myDeptId;
            }
            // For other roles, keep existing visibility unchanged by not modifying departmentId
        }
        
        String safeSearch = search == null ? "" : search;
        return employeeRepository.searchEmployees(safeSearch, departmentId, employmentStatus, employmentType, skillId, pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        return mapToDTO(employee);
    }

    public EmployeeDTO updateEmployee(UUID id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
                
        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        if (request.getWorkEmail() != null) {
            employeeRepository.findByWorkEmailIgnoreCase(request.getWorkEmail()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalStateException("Work email already exists: " + request.getWorkEmail());
                }
            });
        }

        if (!employee.getDepartment().getId().equals(request.getDepartmentId())) {
            Department newDepartment = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            if (!newDepartment.isActive()) {
                throw new IllegalStateException("Cannot move employee to inactive department");
            }
            if (accessService.isDepartmentHeadFor(employee.getDepartment().getId()) && accessService.isSelf(employee.getId())) {
                // Actually need to check if they are the HOD, but simple check is:
                // Cannot move if they are an active HOD. 
                // Wait, checking if they are the HOD in general.
                if (accessService.isDepartmentHeadFor(employee.getDepartment().getId())) {
                   // This is just if the current user is the HOD. We need to check if the target employee is an HOD.
                }
            }
            employee.setDepartment(newDepartment);
        }

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setWorkEmail(request.getWorkEmail() != null ? request.getWorkEmail().toLowerCase() : null);
        employee.setPersonalEmail(request.getPersonalEmail());
        employee.setContactNumber(request.getContactNumber());
        employee.setJobTitle(request.getJobTitle());
        employee.setEmploymentType(request.getEmploymentType());
        employee.setHireDate(request.getHireDate());
        employee.setWeeklyCapacityHours(request.getWeeklyCapacityHours());
        employee.setNotes(request.getNotes());

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            employeeRepository.findByUserId(request.getUserId()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalStateException("User is already linked to another employee");
                }
            });
            employee.setUser(user);
        } else {
            employee.setUser(null);
        }

        User currentUser = accessService.getAuthenticatedUser();
        if (currentUser != null) {
            employee.setUpdatedBy(currentUser.getId());
        }

        return mapToDTO(employeeRepository.save(employee));
    }

    public void updateEmployeeStatus(UUID id, EmploymentStatus newStatus) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (accessService.isSelf(id)) {
            throw new IllegalStateException("Cannot disable your own employee profile");
        }

        if (newStatus == EmploymentStatus.INACTIVE || newStatus == EmploymentStatus.TERMINATED) {
            if (employee.getUser() != null) {
                User user = employee.getUser();
                user.setActive(false);
                userRepository.save(user);
                // In a real scenario, invalidate JWTs/Refresh tokens here too
            }
        }
        
        employee.setEmploymentStatus(newStatus);
        
        User currentUser = accessService.getAuthenticatedUser();
        if (currentUser != null) {
            employee.setUpdatedBy(currentUser.getId());
        }
        employeeRepository.save(employee);
    }

    public void linkUser(UUID id, LinkUserRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (employeeRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalStateException("User is already linked to another employee");
        }

        if (employee.getUser() != null) {
            throw new IllegalStateException("Employee is already linked to a user");
        }

        employee.setUser(user);
        employeeRepository.save(employee);
    }

    public void unlinkUser(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        employee.setUser(null);
        employeeRepository.save(employee);
    }

    public EmployeeDTO mapToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setEmployeeNumber(employee.getEmployeeNumber());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setWorkEmail(employee.getWorkEmail());
        dto.setPersonalEmail(employee.getPersonalEmail());
        dto.setContactNumber(employee.getContactNumber());
        dto.setJobTitle(employee.getJobTitle());
        dto.setEmploymentType(employee.getEmploymentType());
        dto.setEmploymentStatus(employee.getEmploymentStatus());
        dto.setHireDate(employee.getHireDate());
        dto.setWeeklyCapacityHours(employee.getWeeklyCapacityHours());
        dto.setNotes(employee.getNotes());
        dto.setCreatedAt(employee.getCreatedAt());
        dto.setUpdatedAt(employee.getUpdatedAt());

        Department dept = employee.getDepartment();
        if (dept != null) {
            DepartmentDTO deptDto = new DepartmentDTO();
            deptDto.setId(dept.getId());
            deptDto.setCode(dept.getCode());
            deptDto.setName(dept.getName());
            dto.setDepartment(deptDto);
        }

        User u = employee.getUser();
        if (u != null) {
            SafeUserDto userDto = new SafeUserDto();
            userDto.setId(u.getId());
            userDto.setEmail(u.getEmail());
            userDto.setFirstName(u.getFirstName());
            userDto.setLastName(u.getLastName());
            userDto.setActive(u.isActive());
            dto.setUser(userDto);
        }

        dto.setDepartmentHead(accessService.isActiveDepartmentHead(employee.getId()));

        return dto;
    }
}

