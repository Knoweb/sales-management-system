import React, { useState } from 'react';
import { VirtualTourApi, type VirtualTourRequest } from '../../../services/VirtualTourApi';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';

interface VirtualTourFormProps {
  leadId?: string;
  opportunityId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const VirtualTourForm: React.FC<VirtualTourFormProps> = ({
  leadId,
  opportunityId,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<VirtualTourRequest>({
    leadId,
    opportunityId,
    platform: '',
    status: 'SCHEDULED',
    tourDate: new Date().toISOString().slice(0, 16),
    notes: '',
    language: 'English',
    demonstratedProduct: '',
    probabilityBefore: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        tourDate: new Date(formData.tourDate).toISOString(),
      };
      await VirtualTourApi.createVirtualTour(payload);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule virtual tour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-primary">
      <h3 className="text-section-title" style={{ marginBottom: '1rem' }}>Schedule Virtual Tour</h3>
      {error && <div style={{ marginBottom: '1rem', padding: '12px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '4px', fontSize: '14px' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Platform</label>
          <select
            name="platform"
            required
            value={formData.platform}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select Platform</option>
            <option value="Zoom">Zoom</option>
            <option value="Google Meet">Google Meet</option>
            <option value="Microsoft Teams">Microsoft Teams</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Tour Date & Time</label>
          <input
            type="datetime-local"
            name="tourDate"
            required
            value={formData.tourDate}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Language</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="form-input"
          >
            <option value="English">English</option>
            <option value="Sinhala">Sinhala</option>
            <option value="Tamil">Tamil</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Demonstrated Product</label>
          <input
            type="text"
            name="demonstratedProduct"
            value={formData.demonstratedProduct}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. Premium Package, Cloud Hosting"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Sales Probability Before Tour (%)</label>
          <input
            type="number"
            name="probabilityBefore"
            min="0"
            max="100"
            value={formData.probabilityBefore}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes (Optional)</label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="form-input"
            placeholder="Agenda or instructions for the tour..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            isLoading={loading}
          >
            {loading ? 'Scheduling...' : 'Schedule Tour'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
