import React, { useState, useEffect, useCallback } from 'react';
import { getMyNotificationPreferences, updateNotificationPreference } from '../../api/notificationApi';
import type { NotificationPreferenceDTO } from '../../api/notificationApi';
import { LoadingState } from '../../components/FeedbackStates';

export const NotificationPreferencesPanel: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferenceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyNotificationPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = async (id: string, inAppEnabled: boolean, emailEnabled: boolean) => {
    try {
      const updated = await updateNotificationPreference(id, inAppEnabled, emailEnabled);
      setPreferences(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Notification Preferences</h1>
          <p className="page-subtitle">Choose how you want to be notified.</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8"><LoadingState message="Loading preferences..." /></div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Notification Type</th>
                  <th>In-App</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {preferences.map(pref => (
                  <tr key={pref.id}>
                    <td className="font-medium">{pref.notificationType.replace(/_/g, ' ')}</td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={pref.inAppEnabled} 
                        onChange={(e) => handleToggle(pref.id, e.target.checked, pref.emailEnabled)}
                      />
                    </td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={pref.emailEnabled} 
                        onChange={(e) => handleToggle(pref.id, pref.inAppEnabled, e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferencesPanel;
