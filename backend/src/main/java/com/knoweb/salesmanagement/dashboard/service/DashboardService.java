package com.knoweb.salesmanagement.dashboard.service;

import com.knoweb.salesmanagement.dashboard.dto.DashboardMetricsDto;
import com.knoweb.salesmanagement.dashboard.dto.SalesForecastDto;
import com.knoweb.salesmanagement.dashboard.dto.UtilizationDto;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.quotation.entity.Quotation;
import com.knoweb.salesmanagement.quotation.repository.QuotationRepository;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final LeadRepository leadRepository;
    private final SalesOpportunityRepository opportunityRepository;
    private final QuotationRepository quotationRepository;
    private final TechnicalProjectRepository technicalProjectRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DashboardService(LeadRepository leadRepository,
                            SalesOpportunityRepository opportunityRepository,
                            QuotationRepository quotationRepository,
                            TechnicalProjectRepository technicalProjectRepository,
                            DepartmentRepository departmentRepository,
                            EmployeeRepository employeeRepository) {
        this.leadRepository = leadRepository;
        this.opportunityRepository = opportunityRepository;
        this.quotationRepository = quotationRepository;
        this.technicalProjectRepository = technicalProjectRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    private boolean isSalesOfficer(CustomUserDetails user) {
        return user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SALES_OFFICER"));
    }

    private boolean isDeptHead(CustomUserDetails user) {
        return user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HOD"));
    }

    public DashboardMetricsDto getMetrics(CustomUserDetails user) {
        DashboardMetricsDto metrics = new DashboardMetricsDto();
        
        List<Lead> leads = leadRepository.findAll();
        List<SalesOpportunity> opps = opportunityRepository.findAll();
        List<Quotation> quotes = quotationRepository.findAll();
        List<TechnicalProject> projects = technicalProjectRepository.findAll();

        if (isSalesOfficer(user)) {
            leads = leads.stream().filter(l -> user.getId().equals(l.getCreatedBy())).collect(Collectors.toList());
            opps = opps.stream().filter(o -> o.getAssignedSalesOfficer() != null && user.getId().equals(o.getAssignedSalesOfficer().getId())).collect(Collectors.toList());
            quotes = quotes.stream().filter(q -> q.getCreatedBy() == null || user.getId().equals(q.getCreatedBy())).collect(Collectors.toList());
        }

        metrics.setTotalLeads(leads.size());
        
        long activeOpps = opps.stream()
            .filter(o -> o.getStage() != OpportunityStage.CLOSED_WON && o.getStage() != OpportunityStage.LOST)
            .count();
        metrics.setActiveOpportunities(activeOpps);
        
        long pendingQuotes = 0;
        java.util.Map<String, Long> breakdown;

        if (isSalesOfficer(user)) {
            pendingQuotes = quotes.stream()
                .filter(q -> q.getStatus().name().equals("PENDING_CLIENT_APPROVAL") || q.getStatus().name().equals("CLIENT_REQUESTED_REVISION"))
                .count();
            breakdown = quotes.stream()
                .filter(q -> q.getStatus().name().equals("PENDING_CLIENT_APPROVAL") || q.getStatus().name().equals("CLIENT_REQUESTED_REVISION"))
                .collect(Collectors.groupingBy(q -> q.getStatus().name(), Collectors.counting()));
        } else {
            pendingQuotes = quotes.stream()
                .filter(q -> q.getStatus().name().contains("PENDING") || q.getStatus().name().contains("DRAFT") || q.getStatus().name().contains("RETURNED") || q.getStatus().name().contains("REVISION"))
                .count();
            breakdown = quotes.stream()
                .filter(q -> q.getStatus().name().contains("PENDING") || q.getStatus().name().contains("DRAFT") || q.getStatus().name().contains("RETURNED") || q.getStatus().name().contains("REVISION"))
                .collect(Collectors.groupingBy(q -> q.getStatus().name(), Collectors.counting()));
        }
        metrics.setPendingQuotations(pendingQuotes);
        metrics.setQuotationBreakdown(breakdown);
        
        long activeProjects = projects.stream()
            .filter(p -> !p.getStatus().name().equals("COMPLETED"))
            .count();
        metrics.setActiveTechnicalProjects(activeProjects);

        BigDecimal expected = opps.stream()
            .filter(o -> o.getStage() != OpportunityStage.CLOSED_WON && o.getStage() != OpportunityStage.LOST)
            .map(SalesOpportunity::getEstimatedValue)
            .filter(java.util.Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        metrics.setTotalExpectedRevenue(expected);

        BigDecimal confirmed = opps.stream()
            .filter(o -> o.getStage() == OpportunityStage.CLOSED_WON)
            .map(SalesOpportunity::getEstimatedValue)
            .filter(java.util.Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        metrics.setTotalConfirmedRevenue(confirmed);

        return metrics;
    }

    public SalesForecastDto getSalesForecast(CustomUserDetails user) {
        SalesForecastDto forecast = new SalesForecastDto();
        List<SalesOpportunity> opps = opportunityRepository.findAll();

        if (isSalesOfficer(user)) {
            opps = opps.stream().filter(o -> o.getAssignedSalesOfficer() != null && user.getId().equals(o.getAssignedSalesOfficer().getId())).collect(Collectors.toList());
        }

        BigDecimal totalPipeline = BigDecimal.ZERO;
        BigDecimal weightedForecast = BigDecimal.ZERO;
        
        Map<OpportunityStage, List<SalesOpportunity>> byStage = opps.stream().collect(Collectors.groupingBy(SalesOpportunity::getStage));
        
        List<SalesForecastDto.ForecastDetailDto> details = new ArrayList<>();

        for (OpportunityStage stage : OpportunityStage.values()) {
            List<SalesOpportunity> list = byStage.getOrDefault(stage, new ArrayList<>());
            BigDecimal stageValue = list.stream().map(SalesOpportunity::getEstimatedValue).filter(java.util.Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            
            if (stage != OpportunityStage.LOST) {
                totalPipeline = totalPipeline.add(stageValue);
                
                int prob = 0;
                switch(stage) {
                    case CLOSED_WON: prob = 100; break;
                    case QUALIFIED: prob = 50; break;
                    case BRIEF_IN_PROGRESS:
                    case BRIEF_SUBMITTED: prob = 75; break;
                    case READY_FOR_TECHNICAL_ROUTING: prob = 90; break;
                    case ON_HOLD: prob = 25; break;
                    default: prob = 50; break;
                }
                
                BigDecimal stageWeighted = stageValue.multiply(BigDecimal.valueOf(prob)).divide(BigDecimal.valueOf(100));
                weightedForecast = weightedForecast.add(stageWeighted);
            }
            
            details.add(new SalesForecastDto.ForecastDetailDto(stage.name(), stageValue, list.size()));
        }

        forecast.setTotalPipelineValue(totalPipeline);
        forecast.setWeightedForecastValue(weightedForecast);
        forecast.setForecastByStage(details);

        return forecast;
    }

    public List<UtilizationDto> getUtilization(CustomUserDetails user) {
        List<UtilizationDto> result = new ArrayList<>();
        List<Department> departments = departmentRepository.findAll();
        
        // If HOD, only show their department
        if (isDeptHead(user) && !user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMIN"))) {
            Employee emp = employeeRepository.findByUserId(user.getId()).orElse(null);
            if (emp != null && emp.getDepartment() != null) {
                departments = departments.stream().filter(d -> d.getId().equals(emp.getDepartment().getId())).collect(Collectors.toList());
            }
        }
        
        for (Department dept : departments) {
            UtilizationDto dto = new UtilizationDto();
            dto.setDepartmentName(dept.getName());
            
            List<Employee> emps = employeeRepository.findActiveByDepartmentId(dept.getId());
            dto.setTotalEmployees(emps.size());
            
            List<UtilizationDto.EmployeeUtilizationDto> empDtos = new ArrayList<>();
            for (Employee e : emps) {
                empDtos.add(new UtilizationDto.EmployeeUtilizationDto(e.getFirstName() + " " + e.getLastName(), 0)); // We don't have direct task count without querying TechnicalProjectTeam, so mock 0 for now or fetch
            }
            dto.setEmployees(empDtos);
            dto.setActiveProjects(0); // Mock for now
            
            result.add(dto);
        }
        
        return result;
    }
}
