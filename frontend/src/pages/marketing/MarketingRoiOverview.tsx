import React, { useState, useEffect } from 'react';
import { marketingApi } from '../../services/marketingApi';
import type { MarketingRoiOverviewDto } from '../../services/marketingApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { 
  Megaphone, DollarSign, TrendingUp,
  Users, Target, UserCheck, Calculator, ArrowDown,
  BarChart2, SearchX
} from 'lucide-react';
import './MarketingRoi.css';

const MarketingRoiOverview: React.FC = () => {
  const [overview, setOverview] = useState<MarketingRoiOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const canWrite = user?.permissions?.includes('MARKETING_ROI_WRITE');

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const data = await marketingApi.getRoiOverview();
      setOverview(data);
    } catch (error) {
      console.error('Failed to fetch ROI overview', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="roi-container" style={{ textAlign: 'center' }}>Loading dashboard...</div>;
  if (!overview) return <div className="roi-container text-red" style={{ textAlign: 'center' }}>Failed to load data.</div>;

  // Safe metrics
  const qualifiedRate = overview.generatedLeads > 0 
    ? (overview.qualifiedLeads / overview.generatedLeads) * 100 
    : 0;
  
  const conversionRate = overview.qualifiedLeads > 0 
    ? (overview.convertedClients / overview.qualifiedLeads) * 100 
    : 0;

  const netReturn = overview.attributedRevenue - overview.totalMarketingSpend;
  const netReturnColor = netReturn > 0 ? 'text-green' : netReturn < 0 ? 'text-red' : 'text-neutral';
  
  const overallRoiColor = overview.overallRoi === null 
    ? 'text-neutral' 
    : overview.overallRoi > 0 
      ? 'text-green' 
      : overview.overallRoi < 0 
        ? 'text-red' 
        : 'text-neutral';

  const totalCostPerLead = overview.generatedLeads > 0 
    ? overview.totalMarketingSpend / overview.generatedLeads 
    : null;

  const maxFinancial = Math.max(overview.totalMarketingSpend, overview.attributedRevenue, 1);
  const spendWidth = Math.max((overview.totalMarketingSpend / maxFinancial) * 100, 2);
  const revenueWidth = Math.max((overview.attributedRevenue / maxFinancial) * 100, 2);

  return (
    <div className="roi-container">
      
      {/* 1. PAGE HEADER */}
      <div className="roi-header">
        <div className="roi-header-left">
          <h1 className="roi-title">Marketing ROI</h1>
          <p className="roi-subtitle">Track campaign performance, spend, conversions and return on investment.</p>
        </div>
        <div className="roi-header-actions">
          <button onClick={() => navigate('/marketing/campaigns')} className="btn btn-secondary">
            View Campaigns
          </button>
          {canWrite && (
            <button onClick={() => navigate('/marketing/campaigns/new')} className="btn btn-primary">
              + New Campaign
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI CARD GRID */}
      <div className="roi-kpi-grid">
        <div className="roi-kpi-card">
          <div className="roi-kpi-icon-container icon-blue"><Megaphone size={22} /></div>
          <div className="roi-kpi-content">
            <span className="roi-kpi-label">Total Campaigns</span>
            <span className="roi-kpi-value">{formatNumber(overview.totalCampaigns)}</span>
          </div>
        </div>

        <div className="roi-kpi-card">
          <div className="roi-kpi-icon-container icon-amber"><DollarSign size={22} /></div>
          <div className="roi-kpi-content">
            <span className="roi-kpi-label">Total Spend</span>
            <span className="roi-kpi-value">{formatCurrency(overview.totalMarketingSpend)}</span>
          </div>
        </div>

        <div className="roi-kpi-card">
          <div className="roi-kpi-icon-container icon-green"><BarChart2 size={22} /></div>
          <div className="roi-kpi-content">
            <span className="roi-kpi-label">Attributed Revenue</span>
            <span className="roi-kpi-value text-green">{formatCurrency(overview.attributedRevenue)}</span>
          </div>
        </div>

        <div className="roi-kpi-card">
          <div className="roi-kpi-icon-container icon-purple"><TrendingUp size={22} /></div>
          <div className="roi-kpi-content">
            <span className="roi-kpi-label">Overall ROI</span>
            <span className={`roi-kpi-value ${overallRoiColor}`}>{formatPercent(overview.overallRoi)}</span>
          </div>
        </div>

        <div className="roi-kpi-card">
          <div className="roi-kpi-icon-container icon-cyan"><Users size={22} /></div>
          <div className="roi-kpi-content">
            <span className="roi-kpi-label">Generated Leads</span>
            <span className="roi-kpi-value">{formatNumber(overview.generatedLeads)}</span>
          </div>
        </div>

        <div className="roi-kpi-card">
          <div className="roi-kpi-icon-container icon-purple"><Target size={22} /></div>
          <div className="roi-kpi-content">
            <span className="roi-kpi-label">Qualified Leads</span>
            <span className="roi-kpi-value">{formatNumber(overview.qualifiedLeads)}</span>
          </div>
        </div>

        <div className="roi-kpi-card">
          <div className="roi-kpi-icon-container icon-green"><UserCheck size={22} /></div>
          <div className="roi-kpi-content">
            <span className="roi-kpi-label">Converted Clients</span>
            <span className="roi-kpi-value">{formatNumber(overview.convertedClients)}</span>
          </div>
        </div>

        <div className="roi-kpi-card">
          <div className="roi-kpi-icon-container icon-amber"><Calculator size={22} /></div>
          <div className="roi-kpi-content">
            <span className="roi-kpi-label">Cost Per Lead</span>
            <span className="roi-kpi-value">
              {totalCostPerLead !== null ? formatCurrency(totalCostPerLead) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN ANALYTICS SECTION */}
      <div className="roi-analytics-grid">
        
        {/* Campaign Performance Panel */}
        <div className="roi-panel">
          <h2 className="roi-panel-title">Campaign Performance</h2>
          <p className="roi-panel-subtitle">Spend versus attributed revenue</p>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="roi-perf-row">
              <div className="roi-perf-header">
                <span className="roi-perf-label">Marketing Spend</span>
                <span className="roi-perf-value">{formatCurrency(overview.totalMarketingSpend)}</span>
              </div>
              <div className="roi-progress-bg">
                <div className="roi-progress-fill fill-amber" style={{ width: `${spendWidth}%` }}></div>
              </div>
            </div>
            
            <div className="roi-perf-row" style={{ marginBottom: 0 }}>
              <div className="roi-perf-header">
                <span className="roi-perf-label">Attributed Revenue</span>
                <span className="roi-perf-value text-green">{formatCurrency(overview.attributedRevenue)}</span>
              </div>
              <div className="roi-progress-bg">
                <div className="roi-progress-fill fill-green" style={{ width: `${revenueWidth}%` }}></div>
              </div>
            </div>
          </div>

          <div className="roi-net-return">
            <span className="roi-net-label">Net Return</span>
            <span className={`roi-net-value ${netReturnColor}`}>
              {formatCurrency(netReturn)}
            </span>
          </div>
        </div>

        {/* Lead Funnel Panel */}
        <div className="roi-panel">
          <h2 className="roi-panel-title">Lead Funnel</h2>
          <p className="roi-panel-subtitle">Conversion progression through the pipeline</p>
          
          <div className="roi-funnel">
            <div className="roi-funnel-step step-generated">
              <span className="roi-funnel-label">Generated</span>
              <span className="roi-funnel-value">{formatNumber(overview.generatedLeads)}</span>
            </div>

            <div className="roi-funnel-drop">
              <div className="roi-funnel-line"></div>
              <div className="roi-funnel-pct"><ArrowDown size={12} /> {qualifiedRate.toFixed(1)}% qualified</div>
            </div>

            <div className="roi-funnel-step step-qualified">
              <span className="roi-funnel-label">Qualified</span>
              <span className="roi-funnel-value">{formatNumber(overview.qualifiedLeads)}</span>
            </div>

            <div className="roi-funnel-drop">
              <div className="roi-funnel-line"></div>
              <div className="roi-funnel-pct"><ArrowDown size={12} /> {conversionRate.toFixed(1)}% converted</div>
            </div>

            <div className="roi-funnel-step step-converted">
              <span className="roi-funnel-label">Converted</span>
              <span className="roi-funnel-value">{formatNumber(overview.convertedClients)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PLATFORM COMPARISON */}
      <div className="roi-table-card">
        <div className="roi-table-header">
          <h2 className="roi-panel-title">Platform Comparison</h2>
          <p className="roi-subtitle" style={{ margin: 0 }}>Compare campaign effectiveness across acquisition channels.</p>
        </div>
        
        {overview.platformComparisons.length === 0 ? (
          <div className="roi-empty-state">
            <div className="roi-empty-icon"><SearchX size={32} /></div>
            <h3 className="roi-empty-title">No campaign data yet</h3>
            <p className="roi-empty-text">
              Create your first marketing campaign to begin tracking spend, lead generation, conversions and ROI.
            </p>
            {canWrite && (
              <button onClick={() => navigate('/marketing/campaigns/new')} className="btn btn-primary">
                + Create Campaign
              </button>
            )}
          </div>
        ) : (
          <div className="roi-table-container">
            <table className="roi-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th className="roi-text-right">Campaigns</th>
                  <th className="roi-text-right">Spend</th>
                  <th className="roi-text-right">Leads</th>
                  <th className="roi-text-right">Qualified</th>
                  <th className="roi-text-right">Converted</th>
                  <th className="roi-text-right">Revenue</th>
                  <th className="roi-text-right">ROI</th>
                </tr>
              </thead>
              <tbody>
                {overview.platformComparisons.map((pc) => {
                  const platformRoiColor = pc.roiPercentage === null 
                    ? 'text-neutral' 
                    : pc.roiPercentage > 0 
                      ? 'text-green' 
                      : pc.roiPercentage < 0 
                        ? 'text-red' 
                        : 'text-neutral';

                  return (
                    <tr key={pc.platform}>
                      <td><span className="roi-badge-platform">{pc.platform}</span></td>
                      <td className="roi-text-right">{formatNumber(pc.totalCampaigns)}</td>
                      <td className="roi-text-right" style={{ fontWeight: 700 }}>{formatCurrency(pc.totalMarketingCost)}</td>
                      <td className="roi-text-right">{formatNumber(pc.generatedLeads)}</td>
                      <td className="roi-text-right">{formatNumber(pc.qualifiedLeads)}</td>
                      <td className="roi-text-right">{formatNumber(pc.convertedClients)}</td>
                      <td className="roi-text-right text-green" style={{ fontWeight: 700 }}>{formatCurrency(pc.attributedRevenue)}</td>
                      <td className={`roi-text-right ${platformRoiColor}`} style={{ fontWeight: 700 }}>
                        {formatPercent(pc.roiPercentage)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingRoiOverview;
