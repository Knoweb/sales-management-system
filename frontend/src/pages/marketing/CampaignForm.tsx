import React, { useState, useEffect } from 'react';
import { marketingApi, MarketingPlatforms, MarketingCampaignStatuses } from '../../services/marketingApi';
import type { CreateMarketingCampaignRequest } from '../../services/marketingApi';
import { useNavigate, useParams } from 'react-router-dom';
import { Megaphone, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import './MarketingRoi.css';

const CampaignForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CreateMarketingCampaignRequest>({
    name: '',
    platform: 'FACEBOOK',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    objective: '',
    marketingCost: 0,
    status: 'PLANNED',
    notes: ''
  });

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      fetchCampaign(id);
    }
  }, [id, isEditing]);

  const fetchCampaign = async (campaignId: string) => {
    try {
      const data = await marketingApi.getCampaign(campaignId);
      setFormData({
        name: data.name,
        platform: data.platform,
        startDate: data.startDate,
        endDate: data.endDate || '',
        objective: data.objective || '',
        marketingCost: data.marketingCost,
        status: data.status,
        notes: data.notes || ''
      });
    } catch (error) {
      console.error('Failed to fetch campaign', error);
      setError('Failed to load campaign details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'marketingCost' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        endDate: formData.endDate || undefined
      };
      
      if (isEditing && id) {
        await marketingApi.updateCampaign(id, payload);
      } else {
        await marketingApi.createCampaign(payload);
      }
      navigate('/marketing/campaigns');
    } catch (error) {
      console.error('Failed to save campaign', error);
      setError('Failed to save campaign. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="roi-container" style={{ textAlign: 'center' }}>Loading form...</div>;

  return (
    <div className="roi-container" style={{ maxWidth: '860px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="roi-title">
          {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
        </h1>
        <p className="roi-subtitle">Fill out the details below to track marketing performance.</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start' }}>
          <AlertCircle size={20} style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontWeight: 500, fontSize: '14px' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section: Campaign Information */}
        <div className="roi-form-card">
          <div className="roi-form-header">
            <div style={{ width: '32px', height: '32px', backgroundColor: '#EFF6FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginRight: '12px' }}>
              <Megaphone size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Campaign Information</h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 500 }}>Core details about the marketing effort</p>
            </div>
          </div>
          <div className="roi-form-body">
            <div className="form-grid">
              <div className="form-col-full">
                <label className="form-label">
                  Campaign Name <span className="form-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Summer Q3 Promo"
                  className="form-control"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Platform <span className="form-required">*</span>
                </label>
                <select
                  name="platform"
                  required
                  value={formData.platform}
                  onChange={handleChange}
                  className="form-control"
                >
                  {MarketingPlatforms.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Status <span className="form-required">*</span>
                </label>
                <select
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="form-control"
                >
                  {MarketingCampaignStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-col-full" style={{ marginTop: '16px' }}>
                <label className="form-label">Objective</label>
                <input
                  type="text"
                  name="objective"
                  value={formData.objective}
                  onChange={handleChange}
                  placeholder="e.g. Lead Generation, Brand Awareness"
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-grid" style={{ gap: '24px' }}>
          {/* Section: Schedule */}
          <div className="roi-form-card" style={{ marginBottom: 0 }}>
            <div className="roi-form-header">
              <div style={{ width: '32px', height: '32px', backgroundColor: '#F5F3FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', marginRight: '12px' }}>
                <Calendar size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Campaign Period</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 500 }}>Timeline for the campaign</p>
              </div>
            </div>
            <div className="roi-form-body">
              <div className="form-group">
                <label className="form-label">
                  Start Date <span className="form-required">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  className="form-control"
                />
                <p className="form-help">Leave blank if the campaign is ongoing.</p>
              </div>
            </div>
          </div>

          {/* Section: Budget */}
          <div className="roi-form-card" style={{ marginBottom: 0 }}>
            <div className="roi-form-header">
              <div style={{ width: '32px', height: '32px', backgroundColor: '#FFF7E6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginRight: '12px' }}>
                <DollarSign size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Budget</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 500 }}>Marketing investment tracking</p>
              </div>
            </div>
            <div className="roi-form-body">
              <div className="form-group">
                <label className="form-label">
                  Marketing Cost <span className="form-required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>LKR</span>
                  </div>
                  <input
                    type="number"
                    name="marketingCost"
                    required
                    min="0"
                    step="0.01"
                    value={formData.marketingCost}
                    onChange={handleChange}
                    className="form-control"
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
                <p className="form-help">Total allocated spend for this campaign.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Additional Information */}
        <div className="roi-form-card">
          <div className="roi-form-header">
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ECFDF3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', marginRight: '12px' }}>
              <FileText size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Additional Information</h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 500 }}>Notes and targeting details</p>
            </div>
          </div>
          <div className="roi-form-body">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any internal notes or specifics about audience targeting, messaging, etc."
                className="form-control"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => navigate('/marketing/campaigns')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Saving...' : 'Save Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
