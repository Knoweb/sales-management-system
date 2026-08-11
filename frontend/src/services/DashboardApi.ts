import { apiClient } from './Api';

export interface DashboardMetricsDto {
  totalLeads: number;
  activeOpportunities: number;
  pendingQuotations: number;
  activeTechnicalProjects: number;
  totalExpectedRevenue: number;
  totalConfirmedRevenue: number;
  quotationBreakdown?: Record<string, number>;
}

export interface ForecastDetailDto {
  stage: string;
  value: number;
  count: number;
}

export interface SalesForecastDto {
  totalPipelineValue: number;
  weightedForecastValue: number;
  forecastByStage: ForecastDetailDto[];
}

export interface EmployeeUtilizationDto {
  name: string;
  activeAssignments: number;
}

export interface UtilizationDto {
  departmentName: string;
  totalEmployees: number;
  activeProjects: number;
  employees: EmployeeUtilizationDto[];
}

export const DashboardApi = {
  getMetrics: async (): Promise<DashboardMetricsDto> => {
    const response = await apiClient.get('/dashboard/metrics');
    return response.data;
  },

  getSalesForecast: async (): Promise<SalesForecastDto> => {
    const response = await apiClient.get('/dashboard/forecast');
    return response.data;
  },

  getUtilization: async (): Promise<UtilizationDto[]> => {
    const response = await apiClient.get('/dashboard/utilization');
    return response.data;
  }
};
