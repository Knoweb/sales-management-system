import React, { useState, useEffect, useCallback } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { LeadActivity, ActivityType } from '../../types/lead';
import { Phone, Mail, Users, FileText, Settings, Plus, Activity } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { FormField, Select, Input, Textarea } from '../Forms';
import { LoadingState, ErrorState, EmptyState } from '../FeedbackStates';

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
    <Card>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 m-0">Activity Timeline</h3>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" /> Add Activity
        </Button>
      </div>

      <div>
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
            <h4 className="text-md font-medium text-gray-900 mb-4 m-0">New Activity</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Type" required>
                <Select
                  name="activityType"
                  value={newActivity.activityType}
                  onChange={e => setNewActivity(prev => ({ ...prev, activityType: e.target.value as ActivityType }))}
                  required
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
                />
              </FormField>
              
              <div className="md:col-span-2">
                <FormField label="Description" required>
                  <Textarea
                    name="description"
                    rows={3}
                    required
                    value={newActivity.description}
                    onChange={e => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  />
                </FormField>
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Activity</Button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <LoadingState message="Loading timeline..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadActivities} />
        ) : activities.length === 0 ? (
          <EmptyState 
            icon={<Activity size={48} />}
            title="No activities"
            message="No activities logged yet."
          />
        ) : (
          <div className="relative pl-8 mt-2">
            <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full"></div>
            {activities.map(activity => (
              <div key={activity.id} className="relative mb-6">
                <div className={`absolute -left-8 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ring-4 ring-white
                  ${activity.activityType === 'SYSTEM_EVENT' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm ml-2">
                  <div className="flex justify-between items-start sm:items-center mb-2 flex-col sm:flex-row gap-2 sm:gap-0">
                    <h4 className="m-0 text-base font-medium text-gray-900 flex items-center gap-2">
                      {activity.activityType.replace('_', ' ')}
                    </h4>
                    <span className="text-sm text-gray-500 font-medium">
                      {new Date(activity.activityDate).toLocaleString()}
                    </span>
                  </div>
                  <p className="m-0 text-gray-700 whitespace-pre-wrap mt-2">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
