package com.knoweb.salesmanagement.availability.controller;

import com.knoweb.salesmanagement.availability.dto.AvailabilityResponseDTO;
import com.knoweb.salesmanagement.availability.service.AvailabilityService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees/{employeeId}/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_AVAILABILITY_READ')")
    public AvailabilityResponseDTO checkAvailability(
            @PathVariable UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return availabilityService.checkEmployeeAvailability(employeeId, startDate, endDate);
    }
}
