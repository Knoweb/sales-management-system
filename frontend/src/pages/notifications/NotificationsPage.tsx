import React, { useState, useEffect, useCallback } from 'react';
import { getMyNotifications, markNotificationAsRead } from '../../api/notificationApi';
import type { NotificationDTO } from '../../api/notificationApi';
import { Button } from '../../components/Button';
import { LoadingState, EmptyState } from '../../components/FeedbackStates';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      let extracted: NotificationDTO[] = [];
      if (Array.isArray(data)) {
        extracted = data;
      } else if ((data as any).content && Array.isArray((data as any).content)) {
        extracted = (data as any).content;
      }
      setNotifications(extracted);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const displayedNotifications = notifications.filter(n => filter === 'ALL' || !n.read);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">View and manage your recent activity.</p>
        </div>
        <div className="header-actions">
          <Button onClick={handleMarkAllAsRead} variant="outline" disabled={loading || notifications.filter(n => !n.read).length === 0}>
            <CheckCheck size={18} />
            <span>Mark All as Read</span>
          </Button>
          <Link to="/notifications/preferences" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">Preferences</Button>
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant={filter === 'ALL' ? 'primary' : 'ghost'} 
              onClick={() => setFilter('ALL')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'UNREAD' ? 'primary' : 'ghost'} 
              onClick={() => setFilter('UNREAD')}
            >
              Unread
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8"><LoadingState message="Loading notifications..." /></div>
        ) : displayedNotifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Bell size={48} />}
              title="No notifications found"
              message={filter === 'UNREAD' ? "You're all caught up!" : "You don't have any notifications yet."}
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedNotifications.map(notification => (
                  <tr key={notification.id} className={!notification.read ? 'bg-info-bg' : ''}>
                    <td>
                      {!notification.read && <span className="badge badge-info">New</span>}
                    </td>
                    <td>{notification.notificationType}</td>
                    <td className="font-medium">{notification.title}</td>
                    <td>{notification.message}</td>
                    <td>{new Date(notification.createdAt).toLocaleString()}</td>
                    <td className="text-right">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          className="text-sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
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

export default NotificationsPage;
