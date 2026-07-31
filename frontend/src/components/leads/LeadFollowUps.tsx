import React, { useState, useEffect, useCallback } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { FollowUp, FollowUpStatus } from '../../types/lead';
import { Button } from '../Button';
import { Calendar, CheckCircle, Plus } from 'lucide-react';
import { FormField, Input, Select, Textarea } from '../Forms';
import { Card } from '../Card';

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

  const getStatusDisplay = (fu: FollowUp) => {
    if (fu.status === 'COMPLETED') return { label: 'Completed', bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'var(--color-success)' };
    if (fu.status === 'CANCELLED') return { label: 'Cancelled', bg: 'var(--color-surface-secondary)', color: 'var(--color-text-secondary)', border: 'var(--color-text-muted)' };
    
    // PENDING logic
    // eslint-disable-next-line react-hooks/purity
    const isOverdue = new Date(fu.followUpDate).getTime() < Date.now();
    if (isOverdue) {
      return { label: 'Overdue', bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: 'var(--color-danger)' };
    }
    return { label: 'Pending', bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: 'var(--color-warning)' };
  };

  return (
    <Card>
      <div className="flex-between mb-6 border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-text-primary">Follow-Ups</h3>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" /> Schedule Follow-Up
        </Button>
      </div>
      
      <div>
        {showForm && (
          <div className="bg-surface-secondary p-4 rounded-lg mb-6 border border-border">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Date & Time" required>
                <Input
                  type="datetime-local"
                  required
                  value={newFollowUp.followUpDate}
                  onChange={e => setNewFollowUp(prev => ({ ...prev, followUpDate: e.target.value }))}
                />
              </FormField>
              <FormField label="Status" required>
                <Select
                  required
                  value={newFollowUp.status}
                  onChange={e => setNewFollowUp(prev => ({ ...prev, status: e.target.value as FollowUpStatus }))}
                >
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Notes">
                  <Textarea
                    rows={3}
                    value={newFollowUp.notes}
                    onChange={e => setNewFollowUp(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </FormField>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Follow-Up</Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-text-secondary py-4 text-center">Loading follow-ups...</p>
        ) : error ? (
          <p className="text-danger py-4 text-center">{error}</p>
        ) : followUps.length === 0 ? (
          <p className="text-text-muted py-8 text-center bg-surface-secondary rounded-lg border border-dashed border-border">No follow-ups scheduled.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {followUps.map(fu => {
              const display = getStatusDisplay(fu);
              return (
              <div key={fu.id} className="p-4 rounded-lg border border-border" style={{ borderLeft: `4px solid ${display.border}`, backgroundColor: 'var(--color-surface)' }}>
                <div className="flex-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="m-0 text-base flex items-center gap-2 font-medium text-text-primary">
                      <Calendar size={16} className="text-text-muted" />
                      {new Date(fu.followUpDate).toLocaleString()}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ 
                      backgroundColor: display.bg,
                      color: display.color
                    }}>
                      {display.label}
                    </span>
                  </div>
                  {fu.status === 'PENDING' && (
                    <Button variant="ghost" onClick={() => handleComplete(fu.id)} title="Mark as Completed" style={{ color: 'var(--color-success)' }}>
                      <CheckCircle size={18} />
                    </Button>
                  )}
                </div>
                {fu.notes && (
                  <p className="m-0 mt-2 text-sm text-text-secondary">
                    {fu.notes}
                  </p>
                )}
                {fu.assignedToName && (
                  <p className="m-0 mt-2 text-xs text-text-muted">
                    Assigned to: <span className="font-medium text-text-secondary">{fu.assignedToName}</span>
                  </p>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
    </Card>
  );
};
