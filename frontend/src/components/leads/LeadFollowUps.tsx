import React, { useState, useEffect, useCallback } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { FollowUp, FollowUpStatus } from '../../types/lead';
import { Button } from '../Button';
import { Calendar, CheckCircle, Plus } from 'lucide-react';
import { FormField, Input, Select, Textarea } from '../Forms';
import { Card } from '../Card';
import { EmptyState } from '../FeedbackStates';
import { Modal } from '../Modal';

interface LeadFollowUpsProps {
  leadId: string;
}

export const LeadFollowUps: React.FC<LeadFollowUpsProps> = ({ leadId }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
      <div className="flex-between border-b border-border pb-4" style={{ marginBottom: '2rem' }}>
        <h3 className="text-lg font-semibold text-text-primary">Follow-Ups</h3>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" /> Schedule Follow-Up
        </Button>
      </div>
      
      <div>
        <Modal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          title="Schedule Follow-Up" 
          maxWidth="500px"
          bodyStyle={{ overflowY: 'visible' }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
              <FormField label="Date & Time" required>
                <Input
                  type="datetime-local"
                  required
                  value={newFollowUp.followUpDate}
                  onChange={e => setNewFollowUp(prev => ({ ...prev, followUpDate: e.target.value }))}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="Status" required>
                <Select
                  required
                  value={newFollowUp.status}
                  onChange={e => setNewFollowUp(prev => ({ ...prev, status: e.target.value as FollowUpStatus }))}
                  disabled={isSubmitting}
                >
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </FormField>
              <FormField label="Notes">
                <Textarea
                  rows={5}
                  value={newFollowUp.notes}
                  onChange={e => setNewFollowUp(prev => ({ ...prev, notes: e.target.value }))}
                  disabled={isSubmitting}
                  style={{ height: '110px' }}
                />
              </FormField>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '1rem', 
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.25rem',
              marginTop: '0.5rem'
            }}>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
                style={{
                  minWidth: '110px',
                  height: '42px',
                  backgroundColor: 'var(--color-surface-secondary)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: '9px',
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSubmitting}
                style={{
                  minWidth: '110px',
                  height: '42px',
                  borderRadius: '9px',
                  fontWeight: 600,
                }}
              >
                Schedule Follow-Up
              </Button>
            </div>
          </form>
        </Modal>

        {loading ? (
          <p className="text-text-secondary py-4 text-center">Loading follow-ups...</p>
        ) : error ? (
          <p className="text-danger py-4 text-center">{error}</p>
        ) : followUps.length === 0 ? (
          <EmptyState
            title="No follow-ups added"
            message="This lead has no follow-ups."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {followUps.map(fu => {
              const display = getStatusDisplay(fu);
              const dateObj = new Date(fu.followUpDate);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              const formattedDate = `${dateStr} • ${timeStr}`;

              return (
              <div 
                key={fu.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px', 
                  gap: '16px',
                  backgroundColor: 'var(--color-surface)', 
                  borderRadius: '10px', 
                  border: '1px solid var(--color-border)', 
                  borderLeft: `4px solid ${display.border}`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Calendar size={15} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {formattedDate}
                    </span>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '9999px', 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      backgroundColor: display.bg, 
                      color: display.color,
                      marginLeft: '4px'
                    }}>
                      {display.label}
                    </span>
                  </div>
                  
                  {fu.notes && (
                    <div style={{ paddingLeft: '23px', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {fu.notes}
                    </div>
                  )}
                  {fu.assignedToName && (
                    <div style={{ paddingLeft: '23px', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Assigned to: <span style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>{fu.assignedToName}</span>
                    </div>
                  )}
                </div>

                {fu.status === 'PENDING' && (
                  <Button 
                    variant="ghost" 
                    onClick={() => handleComplete(fu.id)} 
                    title="Mark as Completed" 
                    style={{ 
                      flexShrink: 0,
                      color: '#10b981',
                      width: '40px',
                      height: '40px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%'
                    }}
                  >
                    <CheckCircle size={22} />
                  </Button>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
    </Card>
  );
};

