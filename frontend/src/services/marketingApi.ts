import { apiClient } from './Api';

export const MarketingPlatforms = [
  'FACEBOOK',
  'INSTAGRAM',
  'LINKEDIN',
  'GOOGLE',
  'EMAIL',
  'WEBSITE',
  'OTHER'
] as const;

export type MarketingPlatform = typeof MarketingPlatforms[number];

export const MarketingCampaignStatuses = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'PAUSED',
  'CANCELLED'
] as const;

export type MarketingCampaignStatus = typeof MarketingCampaignStatuses[number];

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: MarketingPlatform;
  startDate: string;
  endDate?: string;
  objective?: string;
  marketingCost: number;
  status: MarketingCampaignStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarketingCampaignRequest {
  name: string;
  platform: MarketingPlatform;
  startDate: string;
  endDate?: string;
  objective?: string;
  marketingCost: number;
  status: MarketingCampaignStatus;
  notes?: string;
}

export interface CampaignSummaryDto {
  campaignId: string;
  campaignName: string;
  platform: MarketingPlatform;
  startDate: string;
  endDate?: string;
  status: MarketingCampaignStatus;
  marketingCost: number;
  generatedLeads: number;
  qualifiedLeads: number;
  convertedClients: number;
  attributedRevenue: number;
  costPerLead: number | null;
  costPerCustomer: number | null;
  roiPercentage: number | null;
}

export interface PlatformComparisonDto {
  platform: MarketingPlatform;
  totalCampaigns: number;
  totalMarketingCost: number;
  generatedLeads: number;
  qualifiedLeads: number;
  convertedClients: number;
  attributedRevenue: number;
  costPerLead: number | null;
  costPerCustomer: number | null;
  roiPercentage: number | null;
}

export interface MarketingRoiOverviewDto {
  totalCampaigns: number;
  totalMarketingSpend: number;
  generatedLeads: number;
  qualifiedLeads: number;
  convertedClients: number;
  attributedRevenue: number;
  overallRoi: number | null;
  platformComparisons: PlatformComparisonDto[];
}

const basePath = '/marketing';

export const marketingApi = {
  getCampaigns: async (): Promise<MarketingCampaign[]> => {
    const response = await apiClient.get(`${basePath}/campaigns`);
    return response.data;
  },

  getCampaign: async (id: string): Promise<MarketingCampaign> => {
    const response = await apiClient.get(`${basePath}/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (request: CreateMarketingCampaignRequest): Promise<MarketingCampaign> => {
    const response = await apiClient.post(`${basePath}/campaigns`, request);
    return response.data;
  },

  updateCampaign: async (id: string, request: CreateMarketingCampaignRequest): Promise<MarketingCampaign> => {
    const response = await apiClient.put(`${basePath}/campaigns/${id}`, request);
    return response.data;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await apiClient.delete(`${basePath}/campaigns/${id}`);
  },

  getCampaignSummary: async (id: string): Promise<CampaignSummaryDto> => {
    const response = await apiClient.get(`${basePath}/campaigns/${id}/summary`);
    return response.data;
  },

  getRoiOverview: async (): Promise<MarketingRoiOverviewDto> => {
    const response = await apiClient.get(`${basePath}/roi/overview`);
    return response.data;
  }
};
