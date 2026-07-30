import React, { useState, useEffect, useCallback } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { LeadActivity, ActivityType } from '../../types/lead';
import { Phone, Mail, Users, FileText, Settings, Plus } from 'lucide-react';
import { Button } from '../Button';

interface LeadTimelineProps {
  leadId: string;
}

export const LeadTimeline: React.FC<LeadTimelineProps> = ({ leadId }) => {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
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
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'CALL': return <Phone size={16} />;
      case 'EMAIL': return <Mail size={16} />;
      case 'MEETING': return <Users size={16} />;
      case 'NOTE': return <FileText size={16} />;
      case 'SYSTEM_EVENT': return <Settings size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="card">
      <div className="card-header flex-between">
        <h3 className="card-title">Activity Timeline</h3>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Activity
        </Button>
      </div>
      <div className="card-body">
        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg-light)' }}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-control"
                  value={newActivity.activityType}
                  onChange={e => setNewActivity(prev => ({ ...prev, activityType: e.target.value as ActivityType }))}
                >
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Meeting</option>
                  <option value="NOTE">Note</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  required
                  value={newActivity.activityDate}
                  onChange={e => setNewActivity(prev => ({ ...prev, activityDate: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  value={newActivity.description}
                  onChange={e => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Activity</Button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading timeline...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : activities.length === 0 ? (
          <p>No activities logged yet.</p>
        ) : (
          <div className="timeline" style={{ position: 'relative', paddingLeft: '2rem' }}>
            <div style={{ position: 'absolute', left: '0.75rem', top: 0, bottom: 0, width: '2px', backgroundColor: 'var(--border)' }}></div>
            {activities.map(activity => (
              <div key={activity.id} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <div style={{
                  position: 'absolute',
                  left: '-2rem',
                  top: '0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: activity.activityType === 'SYSTEM_EVENT' ? 'var(--bg-secondary)' : 'var(--primary-bg)',
                  color: activity.activityType === 'SYSTEM_EVENT' ? 'var(--text-light)' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  boxShadow: '0 0 0 4px var(--bg-main)'
                }}>
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {activity.activityType.replace('_', ' ')}
                    </h4>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                      {new Date(activity.activityDate).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
