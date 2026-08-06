/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import type { NotificationDTO } from '../api/notificationApi';
import { getMyNotifications, markNotificationAsRead } from '../api/notificationApi';
import { Link } from 'react-router-dom';
import { IconButton } from './IconButton';
import { Button } from './Button';
import { EmptyState, LoadingState } from './FeedbackStates';
import { useAuth } from '../context/AuthContext';

const NotificationsDropdown: React.FC = () => {
  const { user } = useAuth();
  const hasReadPermission = user?.permissions?.includes('NOTIFICATION_SELF_READ') ?? false;

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async (showLoading = false) => {
    if (!hasReadPermission) return;
    try {
      if (showLoading) setLoading(true);
      const data = await getMyNotifications();
      const responseData: any = data;
      
      // Safely extract array from paginated response
      let extracted: NotificationDTO[] = [];
      if (Array.isArray(responseData)) {
        extracted = responseData;
      } else if (responseData && Array.isArray(responseData.content)) {
        extracted = responseData.content;
      } else if (responseData && responseData.data && Array.isArray(responseData.data.content)) {
        extracted = responseData.data.content;
      } else {
        console.warn('Unexpected notifications API response format:', responseData);
      }
      
      setNotifications(extracted);
    } catch (err) {
      console.error('Failed to load notifications', err);
      setNotifications([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [hasReadPermission]);

  useEffect(() => {
    if (!hasReadPermission) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNotifications(true);
    const interval = setInterval(() => void loadNotifications(), 60000);
    return () => clearInterval(interval);
  }, [hasReadPermission, loadNotifications]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!hasReadPermission) {
    return null;
  }


  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const unreadIds = safeNotifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div className="relative">
        <IconButton
          icon={<Bell size={20} />}
          aria-label="View notifications"
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          className={unreadCount > 0 ? "text-primary" : "text-gray-500"}
        />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-danger rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface border border-border rounded-lg shadow-lg z-dropdown overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-border bg-surface-secondary flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-label font-semibold m-0">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                onClick={handleMarkAllAsRead} 
                className="text-xs"
                style={{ padding: '4px 8px', height: 'auto' }}
              >
                <CheckCheck size={14} className="mr-1" /> Mark all as read
              </Button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {loading && safeNotifications.length === 0 ? (
              <div className="p-8">
                <LoadingState message="Loading notifications..." />
              </div>
            ) : safeNotifications.length === 0 ? (
              <div className="p-8">
                <EmptyState 
                  icon={<Bell size={32} />} 
                  title="All caught up!" 
                  message="You don't have any notifications right now."
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {safeNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors duration-200 ${!notification.read ? 'bg-info-bg' : 'bg-transparent hover:bg-surface-secondary'}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-body-small mb-1 truncate ${!notification.read ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-body-small line-clamp-2 ${!notification.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-muted mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="flex-shrink-0 text-primary hover:text-primary-dark transition-colors p-1"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <div className="h-2.5 w-2.5 bg-primary rounded-full"></div>
                        </button>
                      )}
                    </div>
                    
                    {notification.entityType === 'PROJECT_BRIEF' && notification.entityId && (
                      <Link
                        to={`/project-briefs/${notification.entityId}`}
                        onClick={() => {
                          if (!notification.read) {
                            handleMarkAsRead(notification.id).catch(console.error);
                          }
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center text-xs font-medium text-primary hover:text-primary-dark hover:underline mt-3"
                      >
                        View Project Brief &rarr;
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;

