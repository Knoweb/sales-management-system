package com.knoweb.salesmanagement.availability.service;

import com.knoweb.salesmanagement.availability.dto.AvailabilityResponseDTO;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.department.service.DepartmentAccessService;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.leave.entity.EmployeeLeave;
import com.knoweb.salesmanagement.leave.enums.LeaveStatus;
import com.knoweb.salesmanagement.leave.repository.EmployeeLeaveRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AvailabilityService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeLeaveRepository leaveRepository;
    private final DepartmentAccessService accessService;

    public AvailabilityService(EmployeeRepository employeeRepository,
                               EmployeeLeaveRepository leaveRepository,
                               DepartmentAccessService accessService) {
        this.employeeRepository = employeeRepository;
        this.leaveRepository = leaveRepository;
        this.accessService = accessService;
    }

    public AvailabilityResponseDTO checkEmployeeAvailability(UUID employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        AvailabilityResponseDTO response = new AvailabilityResponseDTO();
        response.setEmployeeId(employee.getId());
        response.setEmployeeNumber(employee.getEmployeeNumber());
        response.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        response.setDepartment(employee.getDepartment().getName());
        response.setEmploymentStatus(employee.getEmploymentStatus());
        response.setWeeklyCapacityHours(employee.getWeeklyCapacityHours());
        response.setRequestedStartDate(startDate);
        response.setRequestedEndDate(endDate);

        if (employee.getEmploymentStatus() != EmploymentStatus.ACTIVE) {
            response.setEstimatedCapacityHours(BigDecimal.ZERO);
            response.setApprovedLeaveHours(BigDecimal.ZERO);
            response.setEstimatedAvailableHours(BigDecimal.ZERO);
            response.setAvailabilityPercentage(BigDecimal.ZERO);
            response.setAvailabilityStatus("UNAVAILABLE");
            return response;
        }

        // 1. Calculate working days
        long totalWorkingDays = calculateWorkingDays(startDate, endDate);
        
        // Assuming 5 working days a week, daily capacity = weeklyCapacity / 5
        BigDecimal dailyCapacity = employee.getWeeklyCapacityHours().divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);
        BigDecimal estimatedCapacity = dailyCapacity.multiply(BigDecimal.valueOf(totalWorkingDays));
        response.setEstimatedCapacityHours(estimatedCapacity);

        // 2. Calculate approved leaves within this period
        List<EmployeeLeave> overlappingLeaves = leaveRepository.findOverlappingLeaves(
                employeeId, startDate, endDate, LeaveStatus.APPROVED);

        BigDecimal totalLeaveHours = BigDecimal.ZERO;
        for (EmployeeLeave leave : overlappingLeaves) {
            if (leave.isPartialDay() && leave.getLeaveHours() != null) {
                // Approximate: if it's partial, we just subtract the requested hours (if it falls in our date range)
                // For a more accurate system, we'd distribute this over the days.
                totalLeaveHours = totalLeaveHours.add(leave.getLeaveHours());
            } else {
                // Find overlap
                LocalDate overlapStart = startDate.isAfter(leave.getStartDate()) ? startDate : leave.getStartDate();
                LocalDate overlapEnd = endDate.isBefore(leave.getEndDate()) ? endDate : leave.getEndDate();
                long leaveWorkingDays = calculateWorkingDays(overlapStart, overlapEnd);
                totalLeaveHours = totalLeaveHours.add(dailyCapacity.multiply(BigDecimal.valueOf(leaveWorkingDays)));
            }
        }

        response.setApprovedLeaveHours(totalLeaveHours);

        // 3. Calculate actual availability
        BigDecimal availableHours = estimatedCapacity.subtract(totalLeaveHours);
        if (availableHours.compareTo(BigDecimal.ZERO) < 0) {
            availableHours = BigDecimal.ZERO;
        }
        response.setEstimatedAvailableHours(availableHours);

        if (estimatedCapacity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal percentage = availableHours.divide(estimatedCapacity, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            response.setAvailabilityPercentage(percentage.setScale(2, RoundingMode.HALF_UP));
        } else {
            response.setAvailabilityPercentage(BigDecimal.ZERO);
        }

        if (response.getAvailabilityPercentage().compareTo(BigDecimal.valueOf(80)) >= 0) {
            response.setAvailabilityStatus("AVAILABLE");
        } else if (response.getAvailabilityPercentage().compareTo(BigDecimal.valueOf(30)) >= 0) {
            response.setAvailabilityStatus("PARTIALLY_AVAILABLE");
        } else {
            response.setAvailabilityStatus("UNAVAILABLE");
        }

        return response;
    }

    private long calculateWorkingDays(LocalDate start, LocalDate end) {
        long days = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY && current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                days++;
            }
            current = current.plus(1, ChronoUnit.DAYS);
        }
        return days;
    }
}
