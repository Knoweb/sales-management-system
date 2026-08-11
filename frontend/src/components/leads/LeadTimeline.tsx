import React, { useState, useEffect, useCallback } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { LeadActivity, ActivityType } from '../../types/lead';
import { Plus } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { FormField, Select, Input, Textarea } from '../Forms';
import { LoadingState, ErrorState, EmptyState } from '../FeedbackStates';
import { Modal } from '../Modal';

interface LeadTimelineProps {
  leadId: string;
}

export const LeadTimeline: React.FC<LeadTimelineProps> = ({ leadId }) => {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activityType: 'NOTE' as ActivityType,
    description: '',
    activityDate: new Date().toISOString().slice(0, 16)
  });

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await LeadApi.getActivities(leadId);
      setActivities(data);
    } catch {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadActivities();
  }, [loadActivities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await LeadApi.addActivity(leadId, {
        activityType: newActivity.activityType,
        description: newActivity.description,
        activityDate: new Date(newActivity.activityDate).toISOString()
      });
      setShowForm(false);
      setNewActivity({
        activityType: 'NOTE',
        description: '',
        activityDate: new Date().toISOString().slice(0, 16)
      });
      void loadActivities();
    } catch {
      alert('Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex-between border-b border-border pb-4" style={{ marginBottom: '2rem' }}>
        <h3 className="text-lg font-semibold text-text-primary">Activity Timeline</h3>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" /> Add Activity
        </Button>
      </div>

      <div>
        <Modal 
          isOpen={showForm} 
          onClose={() => setShowForm(false)} 
          title="Add Activity" 
          maxWidth="500px"
          bodyStyle={{ overflowY: 'visible' }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
                <FormField label="Type" required>
                  <Select
                    name="activityType"
                    value={newActivity.activityType}
                    onChange={e => setNewActivity(prev => ({ ...prev, activityType: e.target.value as ActivityType }))}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                    <option value="NOTE">Note</option>
                  </Select>
                </FormField>
                
                <FormField label="Date & Time" required>
                  <Input
                    type="datetime-local"
                    name="activityDate"
                    required
                    value={newActivity.activityDate}
                    onChange={e => setNewActivity(prev => ({ ...prev, activityDate: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </FormField>
                
                <FormField label="Description" required>
                  <Textarea
                    name="description"
                    rows={5}
                    required
                    value={newActivity.description}
                    onChange={e => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
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
                Save Activity
              </Button>
            </div>
          </form>
        </Modal>

        {loading ? (
          <LoadingState message="Loading timeline..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadActivities} />
        ) : activities.length === 0 ? (
          <EmptyState 
            title="No activities added"
            message="This lead has no activity history."
          />
        ) : (
          <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '16px' }}>
            {activities.map((activity, index) => {
              const isLast = index === activities.length - 1;
              return (
                <div key={activity.id} style={{ minWidth: '280px', flex: '0 0 25%', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', zIndex: 1, flexShrink: 0 }} />
                    <div style={{ flex: 1, height: '2px', backgroundColor: isLast ? 'transparent' : 'var(--color-border)' }} />
                  </div>
                  
                  <div style={{ paddingRight: '24px' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '4px 8px', 
                      backgroundColor: '#e0f2fe', 
                      color: '#0369a1', 
                      borderRadius: '6px', 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginBottom: '12px' 
                    }}>
                      {activity.activityType.replace('_', ' ')}
                    </span>
                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {activity.description}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      {new Date(activity.activityDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

