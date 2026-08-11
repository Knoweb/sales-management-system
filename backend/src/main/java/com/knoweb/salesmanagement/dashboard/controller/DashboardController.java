package com.knoweb.salesmanagement.dashboard.controller;

import com.knoweb.salesmanagement.dashboard.dto.DashboardMetricsDto;
import com.knoweb.salesmanagement.dashboard.dto.SalesForecastDto;
import com.knoweb.salesmanagement.dashboard.dto.UtilizationDto;
import com.knoweb.salesmanagement.dashboard.service.DashboardService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsDto> getMetrics(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(dashboardService.getMetrics(user));
    }

    @GetMapping("/forecast")
    public ResponseEntity<SalesForecastDto> getForecast(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(dashboardService.getSalesForecast(user));
    }

    @GetMapping("/utilization")
    public ResponseEntity<List<UtilizationDto>> getUtilization(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(dashboardService.getUtilization(user));
    }
}
