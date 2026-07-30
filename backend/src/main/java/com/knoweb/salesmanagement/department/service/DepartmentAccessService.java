package com.knoweb.salesmanagement.department.service;

import com.knoweb.salesmanagement.department.entity.DepartmentHead;
import com.knoweb.salesmanagement.department.repository.DepartmentHeadRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class DepartmentAccessService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentHeadRepository departmentHeadRepository;

    public DepartmentAccessService(UserRepository userRepository,
                                   EmployeeRepository employeeRepository,
                                   DepartmentHeadRepository departmentHeadRepository) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.departmentHeadRepository = departmentHeadRepository;
    }

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    public boolean hasGlobalAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;

        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_SYSTEM_ADMIN") 
                               || role.equals("ROLE_TOP_MANAGEMENT") 
                               || role.equals("ROLE_TECHNICAL_COORDINATOR"));
    }

    public boolean hasGlobalWriteAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;

        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_SYSTEM_ADMIN"));
    }

    public boolean isDepartmentHeadFor(UUID departmentId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) return false;

        Optional<Employee> currentEmployee = employeeRepository.findByUserId(currentUser.getId());
        if (currentEmployee.isEmpty()) return false;

        Optional<DepartmentHead> head = departmentHeadRepository.findByEmployeeIdAndActiveTrue(currentEmployee.get().getId());
        
        return head.isPresent() && head.get().getDepartment().getId().equals(departmentId);
    }

    public boolean isSelf(UUID employeeId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) return false;

        Optional<Employee> currentEmployee = employeeRepository.findByUserId(currentUser.getId());
        return currentEmployee.isPresent() && currentEmployee.get().getId().equals(employeeId);
    }

    public void validateDepartmentAccess(UUID departmentId) {
        if (hasGlobalAccess()) return;
        
        if (isDepartmentHeadFor(departmentId)) return;

        throw new org.springframework.security.access.AccessDeniedException("Access denied: Not authorized for this department");
    }

    public void validateEmployeeAccess(UUID targetEmployeeId, UUID targetDepartmentId) {
        if (hasGlobalAccess()) return;
        
        if (isSelf(targetEmployeeId)) return;
        
        if (isDepartmentHeadFor(targetDepartmentId)) return;

        throw new org.springframework.security.access.AccessDeniedException("Access denied: Not authorized for this employee");
    }
}
