package com.knoweb.salesmanagement.leave.controller;

import com.knoweb.salesmanagement.leave.dto.EmployeeLeaveDTO;
import com.knoweb.salesmanagement.leave.dto.EmployeeLeaveRequest;
import com.knoweb.salesmanagement.leave.enums.LeaveStatus;
import com.knoweb.salesmanagement.leave.service.EmployeeLeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees/{employeeId}/leaves")
public class EmployeeLeaveController {

    private final EmployeeLeaveService leaveService;

    public EmployeeLeaveController(EmployeeLeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('EMPLOYEE_LEAVE_MANAGE') or hasAuthority('EMPLOYEE_SELF_READ')")
    public EmployeeLeaveDTO submitLeaveRequest(@PathVariable UUID employeeId, @Valid @RequestBody EmployeeLeaveRequest request) {
        return leaveService.submitLeaveRequest(employeeId, request);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_LEAVE_READ')")
    public List<EmployeeLeaveDTO> getEmployeeLeaves(@PathVariable UUID employeeId) {
        return leaveService.getEmployeeLeaves(employeeId);
    }

    @PutMapping("/{leaveId}/status")
    @PreAuthorize("hasAuthority('EMPLOYEE_LEAVE_MANAGE')")
    public EmployeeLeaveDTO updateLeaveStatus(@PathVariable UUID employeeId,
                                              @PathVariable UUID leaveId,
                                              @RequestParam LeaveStatus status) {
        return leaveService.updateLeaveStatus(employeeId, leaveId, status);
    }

    @DeleteMapping("/{leaveId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('EMPLOYEE_LEAVE_MANAGE') or hasAuthority('EMPLOYEE_SELF_READ')")
    public void cancelLeave(@PathVariable UUID employeeId, @PathVariable UUID leaveId) {
        leaveService.cancelLeave(employeeId, leaveId);
    }
}
