import React, { useState, useEffect, useCallback } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { FollowUp, FollowUpStatus } from '../../types/lead';
import { Button } from '../Button';
import { Calendar, CheckCircle, Plus } from 'lucide-react';

interface LeadFollowUpsProps {
  leadId: string;
}

export const LeadFollowUps: React.FC<LeadFollowUpsProps> = ({ leadId }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    followUpDate: new Date().toISOString().slice(0, 16),
    status: 'PENDING' as FollowUpStatus,
    notes: ''
  });

  const loadFollowUps = useCallback(async () => {
    try {
      setLoading(true);
      const data = await LeadApi.getFollowUps(leadId);
      setFollowUps(data);
    } catch {
      setError('Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFollowUps();
  }, [loadFollowUps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await LeadApi.addFollowUp(leadId, {
        followUpDate: new Date(newFollowUp.followUpDate).toISOString(),
        status: newFollowUp.status,
        notes: newFollowUp.notes
      });
      setShowForm(false);
      setNewFollowUp({
        followUpDate: new Date().toISOString().slice(0, 16),
        status: 'PENDING',
        notes: ''
      });
      void loadFollowUps();
    } catch {
      alert('Failed to add follow-up');
    }
  };

  const handleComplete = async (followUpId: string) => {
    try {
      await LeadApi.completeFollowUp(leadId, followUpId);
      void loadFollowUps();
    } catch {
      alert('Failed to complete follow-up');
    }
  };

  return (
    <div className="card">
      <div className="card-header flex-between">
        <h3 className="card-title">Follow-Ups</h3>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Schedule Follow-Up
        </Button>
      </div>
      <div className="card-body">
        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg-light)' }}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  required
                  value={newFollowUp.followUpDate}
                  onChange={e => setNewFollowUp(prev => ({ ...prev, followUpDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-control"
                  required
                  value={newFollowUp.status}
                  onChange={e => setNewFollowUp(prev => ({ ...prev, status: e.target.value as FollowUpStatus }))}
                >
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={newFollowUp.notes}
                  onChange={e => setNewFollowUp(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Follow-Up</Button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading follow-ups...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : followUps.length === 0 ? (
          <p>No follow-ups scheduled.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {followUps.map(fu => (
              <div key={fu.id} className="card" style={{ padding: '1rem', borderLeft: fu.status === 'COMPLETED' ? '4px solid var(--success)' : fu.status === 'PENDING' ? '4px solid var(--warning)' : '4px solid var(--text-light)' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} style={{ color: 'var(--text-light)' }} />
                      {new Date(fu.followUpDate).toLocaleString()}
                    </h4>
                    <span style={{ 
                      padding: '0.125rem 0.5rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem',
                      backgroundColor: fu.status === 'COMPLETED' ? 'var(--success-bg)' : fu.status === 'PENDING' ? 'var(--warning-bg)' : 'var(--bg-secondary)',
                      color: fu.status === 'COMPLETED' ? 'var(--success)' : fu.status === 'PENDING' ? 'var(--warning)' : 'var(--text-light)'
                    }}>
                      {fu.status}
                    </span>
                  </div>
                  {fu.status === 'PENDING' && (
                    <Button variant="ghost" onClick={() => handleComplete(fu.id)} style={{ color: 'var(--success)' }} title="Mark as Completed">
                      <CheckCircle size={18} />
                    </Button>
                  )}
                </div>
                {fu.notes && (
                  <p style={{ margin: 0, marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    {fu.notes}
                  </p>
                )}
                {fu.assignedToName && (
                  <p style={{ margin: 0, marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-light)' }}>
                    Assigned to: {fu.assignedToName}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
