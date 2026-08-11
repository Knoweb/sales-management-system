import React, { useState, useEffect } from 'react';
import { marketingApi } from '../../services/marketingApi';
import type { MarketingCampaign } from '../../services/marketingApi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { Eye, Edit2, SearchX } from 'lucide-react';
import { IconButton } from '../../components/IconButton';
import './MarketingRoi.css';

const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const canWrite = user?.permissions?.includes('MARKETING_ROI_WRITE');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await marketingApi.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="roi-container" style={{ textAlign: 'center' }}>Loading campaigns...</div>;

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

  return (
    <div className="roi-container">
      <div className="roi-header">
        <div className="roi-header-left">
          <h1 className="roi-title">Marketing Campaigns</h1>
          <p className="roi-subtitle">Manage marketing campaigns and measure performance.</p>
        </div>
        <div className="roi-header-actions">
          {canWrite && (
            <button onClick={() => navigate('/marketing/campaigns/new')} className="btn btn-primary">
              + Create Campaign
            </button>
          )}
        </div>
      </div>

      {/* Styled filters/search row could be added here if implemented, as per prompt I'll add a visual placeholder */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <input type="text" className="form-control" placeholder="Search Campaign..." style={{ maxWidth: '300px' }} />
        <select className="form-control" style={{ maxWidth: '200px' }}>
          <option>All Platforms</option>
          <option>FACEBOOK</option>
          <option>GOOGLE_ADS</option>
          <option>LINKEDIN</option>
        </select>
        <select className="form-control" style={{ maxWidth: '200px' }}>
          <option>All Statuses</option>
          <option>ACTIVE</option>
          <option>PLANNED</option>
          <option>PAUSED</option>
          <option>COMPLETED</option>
        </select>
      </div>

      <div className="roi-table-card">
        <div className="roi-table-container">
          <table className="roi-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Platform</th>
                <th>Period</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th className="roi-text-right">Spend</th>
                <th className="roi-text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</td>
                  <td><span className="roi-badge-platform">{c.platform}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{format(new Date(c.startDate), 'MMM d, yyyy')}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{c.endDate ? format(new Date(c.endDate), 'MMM d, yyyy') : 'Ongoing'}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {getStatusBadge(c.status)}
                  </td>
                  <td className="roi-text-right" style={{ fontWeight: 700 }}>
                    {formatCurrency(c.marketingCost)}
                  </td>
                  <td className="roi-text-right">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <IconButton 
                        icon={<Eye size={18} />} 
                        onClick={() => navigate(`/marketing/campaigns/${c.id}`)}
                        title="View Details"
                        variant="ghost"
                      />
                      {canWrite && (
                        <IconButton 
                          icon={<Edit2 size={18} />} 
                          onClick={() => navigate(`/marketing/campaigns/${c.id}/edit`)}
                          title="Edit Campaign"
                          variant="ghost"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 0 }}>
                    <div className="roi-empty-state">
                      <div className="roi-empty-icon"><SearchX size={32} /></div>
                      <h3 className="roi-empty-title">No campaigns found</h3>
                      <p className="roi-empty-text">Get started by creating a new marketing campaign.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignList;
