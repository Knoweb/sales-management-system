import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import type { NotificationDTO } from '../api/notificationApi';
import { getMyNotifications, markNotificationAsRead } from '../api/notificationApi';
import { Link } from 'react-router-dom';
import { IconButton } from './IconButton';

const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getMyNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    void loadNotifications();
    const interval = setInterval(() => void loadNotifications(), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative inline-block text-left">
      <div>
        <div className="relative">
          <IconButton
            icon={<Bell size={20} />}
            aria-label="View notifications"
            onClick={() => setIsOpen(!isOpen)}
          />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1 max-h-96 overflow-y-auto">
            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            </div>
            
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="ml-2 flex-shrink-0 text-xs text-blue-600 hover:text-blue-800"
                        title="Mark as read"
                        aria-label="Mark as read"
                      >
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      </button>
                    )}
                  </div>
                  {notification.entityType === 'PROJECT_BRIEF' && notification.entityId && (
                    <Link
                      to={`/project-briefs/${notification.entityId}`}
                      onClick={() => setIsOpen(false)}
                      className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-500 block"
                    >
                      View Project Brief &rarr;
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;

