package com.knoweb.salesmanagement.leave.service;

import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.department.service.DepartmentAccessService;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.leave.dto.EmployeeLeaveDTO;
import com.knoweb.salesmanagement.leave.dto.EmployeeLeaveRequest;
import com.knoweb.salesmanagement.leave.entity.EmployeeLeave;
import com.knoweb.salesmanagement.leave.enums.LeaveStatus;
import com.knoweb.salesmanagement.leave.repository.EmployeeLeaveRepository;
import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeLeaveService {

    private final EmployeeLeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentAccessService accessService;

    public EmployeeLeaveService(EmployeeLeaveRepository leaveRepository,
                                EmployeeRepository employeeRepository,
                                DepartmentAccessService accessService) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.accessService = accessService;
    }

    public EmployeeLeaveDTO submitLeaveRequest(UUID employeeId, EmployeeLeaveRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        if (leaveRepository.existsOverlappingLeave(employeeId, request.getStartDate(), request.getEndDate(), LeaveStatus.APPROVED)) {
            throw new IllegalStateException("Overlapping approved leave exists for the given dates");
        }

        EmployeeLeave leave = new EmployeeLeave();
        leave.setEmployee(employee);
        leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setPartialDay(request.isPartialDay());
        leave.setLeaveHours(request.getLeaveHours());
        leave.setReason(request.getReason());
        leave.setStatus(LeaveStatus.PENDING); // Initial status

        return mapToDTO(leaveRepository.save(leave));
    }

    @Transactional(readOnly = true)
    public List<EmployeeLeaveDTO> getEmployeeLeaves(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        return leaveRepository.findByEmployeeIdOrderByStartDateDesc(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeLeaveDTO updateLeaveStatus(UUID employeeId, UUID leaveId, LeaveStatus status) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (!accessService.hasGlobalWriteAccess() && !accessService.isDepartmentHeadFor(employee.getDepartment().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Only HOD or Admin can approve/reject leaves");
        }

        EmployeeLeave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave record not found"));

        if (!leave.getEmployee().getId().equals(employeeId)) {
            throw new IllegalStateException("Leave record does not belong to this employee");
        }

        if (status == LeaveStatus.APPROVED) {
            if (leaveRepository.existsOverlappingLeave(employeeId, leave.getStartDate(), leave.getEndDate(), LeaveStatus.APPROVED)) {
                throw new IllegalStateException("Overlapping approved leave exists for the given dates");
            }
        }

        leave.setStatus(status);

        return mapToDTO(leaveRepository.save(leave));
    }

    public void cancelLeave(UUID employeeId, UUID leaveId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        EmployeeLeave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave record not found"));

        if (!leave.getEmployee().getId().equals(employeeId)) {
            throw new IllegalStateException("Leave record does not belong to this employee");
        }

        if (leave.getStatus() == LeaveStatus.APPROVED && leave.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new IllegalStateException("Cannot cancel an approved leave that has already started");
        }

        leave.setStatus(LeaveStatus.CANCELLED);
        
        leaveRepository.save(leave);
    }

    private EmployeeLeaveDTO mapToDTO(EmployeeLeave leave) {
        EmployeeLeaveDTO dto = new EmployeeLeaveDTO();
        dto.setId(leave.getId());
        dto.setLeaveType(leave.getLeaveType());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setPartialDay(leave.isPartialDay());
        dto.setLeaveHours(leave.getLeaveHours());
        dto.setStatus(leave.getStatus());
        dto.setReason(leave.getReason());
        dto.setCreatedAt(leave.getCreatedAt());
        dto.setUpdatedAt(leave.getUpdatedAt());
        return dto;
    }
}
