import React, { useState, useEffect } from 'react';
import { marketingApi } from '../../services/marketingApi';
import type { CampaignSummaryDto } from '../../services/marketingApi';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { 
  DollarSign, TrendingUp, Users, Target, UserCheck, 
  Calendar, ArrowDown 
} from 'lucide-react';
import './MarketingRoi.css';

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CampaignSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const canWrite = user?.permissions?.includes('MARKETING_ROI_WRITE');

  useEffect(() => {
    if (id) {
      fetchSummary(id);
    }
  }, [id]);

  const fetchSummary = async (campaignId: string) => {
    try {
      const data = await marketingApi.getCampaignSummary(campaignId);
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch campaign summary', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="roi-badge-platform roi-badge-status-active">ACTIVE</span>;
      case 'COMPLETED':
        return <span className="roi-badge-platform roi-badge-status-completed">COMPLETED</span>;
      case 'PLANNED':
        return <span className="roi-badge-platform roi-badge-status-planned">PLANNED</span>;
      case 'PAUSED':
        return <span className="roi-badge-platform roi-badge-status-paused">PAUSED</span>;
      default:
        return <span className="roi-badge-platform">{status}</span>;
    }
  };

  if (loading) return <div className="roi-container" style={{ textAlign: 'center' }}>Loading campaign details...</div>;
  if (!summary) return <div className="roi-container text-red" style={{ textAlign: 'center' }}>Failed to load campaign data.</div>;

  const netReturn = summary.attributedRevenue - summary.marketingCost;
  const netReturnColor = netReturn > 0 ? 'text-green' : netReturn < 0 ? 'text-red' : 'text-neutral';

  const roiColor = summary.roiPercentage === null 
    ? 'text-neutral' 
    : summary.roiPercentage > 0 
      ? 'text-green' 
      : summary.roiPercentage < 0 
        ? 'text-red' 
        : 'text-neutral';

  const qualifiedRate = summary.generatedLeads > 0 
    ? (summary.qualifiedLeads / summary.generatedLeads) * 100 
    : 0;
  
  const conversionRate = summary.qualifiedLeads > 0 
    ? (summary.convertedClients / summary.qualifiedLeads) * 100 
    : 0;

  return (
    <div className="roi-container">
      
      {/* Top Header Section */}
      <div className="roi-details-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 className="roi-title" style={{ margin: 0 }}>{summary.campaignName}</h1>
            {getStatusBadge(summary.status)}
            <span className="roi-badge-platform">{summary.platform}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
            <Calendar size={16} style={{ marginRight: '8px' }} />
            {format(new Date(summary.startDate), 'MMMM d, yyyy')} - {summary.endDate ? format(new Date(summary.endDate), 'MMMM d, yyyy') : 'Ongoing'}
          </div>
        </div>
        <div className="roi-header-actions">
          <button onClick={() => navigate('/marketing/campaigns')} className="btn btn-secondary">
            Back to List
          </button>
          {canWrite && (
            <button onClick={() => navigate(`/marketing/campaigns/${summary.campaignId}/edit`)} className="btn btn-primary">
              Edit Campaign
            </button>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="roi-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="roi-kpi-card" style={{ height: 'auto', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div className="roi-kpi-icon-container icon-amber" style={{ width: '28px', height: '28px', marginRight: '8px', borderRadius: '6px' }}><DollarSign size={16} /></div>
            <span className="roi-kpi-label" style={{ margin: 0 }}>Spend</span>
          </div>
          <span className="roi-kpi-value">{formatCurrency(summary.marketingCost)}</span>
        </div>
        
        <div className="roi-kpi-card" style={{ height: 'auto', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div className="roi-kpi-icon-container icon-green" style={{ width: '28px', height: '28px', marginRight: '8px', borderRadius: '6px' }}><TrendingUp size={16} /></div>
            <span className="roi-kpi-label" style={{ margin: 0 }}>Revenue</span>
          </div>
          <span className="roi-kpi-value text-green">{formatCurrency(summary.attributedRevenue)}</span>
        </div>

        <div className="roi-kpi-card" style={{ height: 'auto', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div className="roi-kpi-icon-container icon-purple" style={{ width: '28px', height: '28px', marginRight: '8px', borderRadius: '6px' }}><TrendingUp size={16} /></div>
            <span className="roi-kpi-label" style={{ margin: 0 }}>ROI</span>
          </div>
          <span className={`roi-kpi-value ${roiColor}`}>{formatPercent(summary.roiPercentage)}</span>
        </div>

        <div className="roi-kpi-card" style={{ height: 'auto', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div className="roi-kpi-icon-container icon-cyan" style={{ width: '28px', height: '28px', marginRight: '8px', borderRadius: '6px' }}><Users size={16} /></div>
            <span className="roi-kpi-label" style={{ margin: 0 }}>Leads</span>
          </div>
          <span className="roi-kpi-value">{formatNumber(summary.generatedLeads)}</span>
        </div>

        <div className="roi-kpi-card" style={{ height: 'auto', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div className="roi-kpi-icon-container icon-purple" style={{ width: '28px', height: '28px', marginRight: '8px', borderRadius: '6px' }}><Target size={16} /></div>
            <span className="roi-kpi-label" style={{ margin: 0 }}>Qualified</span>
          </div>
          <span className="roi-kpi-value">{formatNumber(summary.qualifiedLeads)}</span>
        </div>

        <div className="roi-kpi-card" style={{ height: 'auto', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div className="roi-kpi-icon-container icon-green" style={{ width: '28px', height: '28px', marginRight: '8px', borderRadius: '6px' }}><UserCheck size={16} /></div>
            <span className="roi-kpi-label" style={{ margin: 0 }}>Clients</span>
          </div>
          <span className="roi-kpi-value">{formatNumber(summary.convertedClients)}</span>
        </div>
      </div>

      <div className="roi-analytics-grid">
        {/* Left: ROI Breakdown */}
        <div className="roi-table-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="roi-table-header">
            <h3 className="roi-panel-title">ROI Breakdown</h3>
            <p className="roi-subtitle" style={{ margin: 0 }}>Financial summary and acquisition costs</p>
          </div>
          <div className="roi-table-container" style={{ flex: 1 }}>
            <table className="roi-table" style={{ width: '100%', height: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Marketing Spend</td>
                  <td className="roi-text-right" style={{ fontWeight: 700, color: '#0F172A' }}>{formatCurrency(summary.marketingCost)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Attributed Revenue</td>
                  <td className="roi-text-right text-green" style={{ fontWeight: 700 }}>{formatCurrency(summary.attributedRevenue)}</td>
                </tr>
                <tr style={{ backgroundColor: '#F8FAFC', borderTop: '2px solid #E2E8F0', borderBottom: '2px solid #E2E8F0' }}>
                  <td style={{ fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Return</td>
                  <td className={`roi-text-right ${netReturnColor}`} style={{ fontWeight: 700 }}>
                    {formatCurrency(netReturn)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Cost Per Lead (CPL)</td>
                  <td className="roi-text-right" style={{ fontWeight: 700, color: '#0F172A' }}>{formatCurrency(summary.costPerLead)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Cost Per Customer (CPC)</td>
                  <td className="roi-text-right" style={{ fontWeight: 700, color: '#0F172A' }}>{formatCurrency(summary.costPerCustomer)}</td>
                </tr>
                <tr style={{ backgroundColor: '#EFF6FF', borderTop: '2px solid #BFDBFE' }}>
                  <td style={{ fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Return on Investment</td>
                  <td className={`roi-text-right ${roiColor}`} style={{ fontWeight: 800, fontSize: '18px' }}>{formatPercent(summary.roiPercentage)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Conversion Funnel */}
        <div className="roi-table-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="roi-table-header">
            <h3 className="roi-panel-title">Conversion Funnel</h3>
            <p className="roi-subtitle" style={{ margin: 0 }}>Lead progression and acquisition metrics</p>
          </div>
          <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            
            <div className="roi-funnel">
              <div className="roi-funnel-step step-generated">
                <span className="roi-funnel-label" style={{ display: 'flex', alignItems: 'center' }}>
                  <Users size={16} style={{ marginRight: '8px' }} /> Generated Leads
                </span>
                <span className="roi-funnel-value">{formatNumber(summary.generatedLeads)}</span>
              </div>

              <div className="roi-funnel-drop">
                <div className="roi-funnel-line" style={{ height: '40px' }}></div>
                <div className="roi-funnel-pct" style={{ top: '10px' }}><ArrowDown size={14} /> {qualifiedRate.toFixed(1)}% qualified</div>
              </div>

              <div className="roi-funnel-step step-qualified">
                <span className="roi-funnel-label" style={{ display: 'flex', alignItems: 'center' }}>
                  <Target size={16} style={{ marginRight: '8px' }} /> Qualified Leads
                </span>
                <span className="roi-funnel-value">{formatNumber(summary.qualifiedLeads)}</span>
              </div>

              <div className="roi-funnel-drop">
                <div className="roi-funnel-line" style={{ height: '40px' }}></div>
                <div className="roi-funnel-pct" style={{ top: '10px' }}><ArrowDown size={14} /> {conversionRate.toFixed(1)}% converted</div>
              </div>

              <div className="roi-funnel-step step-converted">
                <span className="roi-funnel-label" style={{ display: 'flex', alignItems: 'center' }}>
                  <UserCheck size={16} style={{ marginRight: '8px' }} /> Converted Clients
                </span>
                <span className="roi-funnel-value">{formatNumber(summary.convertedClients)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
