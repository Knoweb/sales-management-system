import React, { useEffect, useState } from 'react';
import { VirtualTourApi, type VirtualTour } from '../../../services/VirtualTourApi';
import { VirtualTourForm } from './VirtualTourForm';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';

interface VirtualTourHistoryProps {
  leadId?: string;
  opportunityId?: string;
}

export const VirtualTourHistory: React.FC<VirtualTourHistoryProps> = ({ leadId, opportunityId }) => {
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [completionTourId, setCompletionTourId] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState({
    probabilityAfter: 0,
    clientResponse: '',
    followUpRequired: false
  });

  const fetchTours = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: VirtualTour[] = [];
      if (leadId) {
        data = await VirtualTourApi.getToursByLead(leadId);
      } else if (opportunityId) {
        data = await VirtualTourApi.getToursByOpportunity(opportunityId);
      }
      setTours(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load virtual tours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId || opportunityId) {
      fetchTours();
    }
  }, [leadId, opportunityId]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus === 'COMPLETED') {
      setCompletionTourId(id);
      return;
    }
    try {
      await VirtualTourApi.updateTourStatus(id, newStatus);
      fetchTours();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionTourId) return;
    try {
      const tourToUpdate = tours.find(t => t.id === completionTourId);
      if (!tourToUpdate) return;
      
      const payload = {
        ...tourToUpdate,
        status: 'COMPLETED' as const,
        probabilityAfter: completionData.probabilityAfter,
        clientResponse: completionData.clientResponse,
        followUpRequired: completionData.followUpRequired
      };
      
      await VirtualTourApi.updateTour(completionTourId, payload);
      setCompletionTourId(null);
      setCompletionData({ probabilityAfter: 0, clientResponse: '', followUpRequired: false });
      fetchTours();
    } catch (err) {
      alert('Failed to save completion metrics');
    }
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="text-section-title">Virtual Tours</h2>
        {!showForm && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
          >
            Schedule Tour
          </Button>
        )}
      </div>

      {showForm && (
        <VirtualTourForm
          leadId={leadId}
          opportunityId={opportunityId}
          onSuccess={() => {
            setShowForm(false);
            fetchTours();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div style={{ color: 'var(--color-text-muted)' }}>Loading virtual tours...</div>
      ) : error ? (
        <div style={{ color: 'var(--color-danger)' }}>{error}</div>
      ) : tours.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No virtual tours recorded yet.</div>
      ) : (
        <Card className="card-secondary" style={{ padding: 0 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {tours.map((tour, index) => (
              <li key={tour.id} style={{ 
                padding: '1rem', 
                borderBottom: index < tours.length - 1 ? '1px solid var(--color-border)' : 'none',
                backgroundColor: 'var(--color-surface)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {tour.platform} Tour ({tour.language || 'English'})
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {new Date(tour.tourDate).toLocaleString()} 
                      {tour.demonstratedProduct && ` • Product: ${tour.demonstratedProduct}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: tour.status === 'COMPLETED' ? '#ecfdf5' : tour.status === 'CANCELLED' ? '#fef2f2' : '#eff6ff',
                      color: tour.status === 'COMPLETED' ? '#047857' : tour.status === 'CANCELLED' ? '#b91c1c' : '#1d4ed8'
                    }}>
                      {tour.status}
                    </span>
                    {tour.status === 'SCHEDULED' && (
                      <select
                        onChange={(e) => handleStatusChange(tour.id, e.target.value)}
                        className="form-input"
                        style={{ fontSize: '12px', padding: '4px 8px', width: 'auto' }}
                        defaultValue=""
                      >
                        <option value="" disabled>Update Status</option>
                        <option value="COMPLETED">Mark Completed</option>
                        <option value="CANCELLED">Cancel</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                    )}
                  </div>
                </div>
                {tour.notes && (
                  <div style={{ marginTop: '0.5rem', fontSize: '14px', color: 'var(--color-text)', backgroundColor: 'var(--color-background)', padding: '0.5rem', borderRadius: '4px' }}>
                    <strong>Notes:</strong> {tour.notes}
                  </div>
                )}
                {tour.clientResponse && (
                  <div style={{ marginTop: '0.5rem', fontSize: '14px', color: 'var(--color-text)', backgroundColor: '#f0fdf4', borderLeft: '3px solid #16a34a', padding: '0.5rem', borderRadius: '4px' }}>
                    <strong>Client Feedback:</strong> {tour.clientResponse}
                    {tour.followUpRequired && <span style={{ color: '#dc2626', fontWeight: 600, marginLeft: '8px' }}>(Follow-up Required)</span>}
                  </div>
                )}
                {(tour.probabilityBefore !== null && tour.probabilityBefore !== undefined) && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Probability Before:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{tour.probabilityBefore}%</strong>
                    </div>
                    {(tour.probabilityAfter !== null && tour.probabilityAfter !== undefined) && (
                      <>
                        <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>After:</span>
                          <strong style={{ color: tour.probabilityAfter >= tour.probabilityBefore ? '#16a34a' : '#dc2626' }}>
                            {tour.probabilityAfter}%
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {completionTourId === tour.id && (
                  <form onSubmit={handleCompletionSubmit} style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Complete Tour Metrics</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Client Response / Feedback</label>
                        <textarea 
                          required
                          className="form-input" 
                          rows={2} 
                          value={completionData.clientResponse}
                          onChange={e => setCompletionData({...completionData, clientResponse: e.target.value})}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Probability After Tour (%)</label>
                          <input 
                            required
                            type="number" 
                            min="0" max="100" 
                            className="form-input"
                            value={completionData.probabilityAfter}
                            onChange={e => setCompletionData({...completionData, probabilityAfter: Number(e.target.value)})}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '28px' }}>
                          <input 
                            type="checkbox" 
                            id={`followup-${tour.id}`}
                            checked={completionData.followUpRequired}
                            onChange={e => setCompletionData({...completionData, followUpRequired: e.target.checked})}
                          />
                          <label htmlFor={`followup-${tour.id}`} style={{ fontSize: '14px', fontWeight: 500 }}>Follow-up Required?</label>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <Button type="button" variant="secondary" onClick={() => setCompletionTourId(null)}>Cancel</Button>
                        <Button type="submit" variant="primary">Save & Mark Completed</Button>
                      </div>
                    </div>
                  </form>
                )}

                {tour.conductedByName && (
                  <div style={{ marginTop: '0.75rem', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Conducted by: {tour.conductedByName}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
