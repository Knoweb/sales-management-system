/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, ClipboardList, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import type { NotificationDTO } from '../api/notificationApi';
import { getMyNotifications, markNotificationAsRead } from '../api/notificationApi';
import { useNavigate } from 'react-router-dom';
import { IconButton } from './IconButton';
import { useAuth } from '../context/AuthContext';

const getNotificationIcon = (type: string) => {
  const t = (type || '').toUpperCase();
  if (t.includes('ASSIGN')) {
    return { icon: <ClipboardList size={18} className="text-blue-600" />, bg: 'bg-blue-50' };
  }
  if (t.includes('APPROV') || t.includes('SUCCESS')) {
    return { icon: <CheckCircle2 size={18} className="text-green-600" />, bg: 'bg-green-50' };
  }
  if (t.includes('WARN') || t.includes('DELAY')) {
    return { icon: <AlertTriangle size={18} className="text-amber-600" />, bg: 'bg-amber-50' };
  }
  if (t.includes('ISSUE') || t.includes('REJECT') || t.includes('ERROR')) {
    return { icon: <AlertCircle size={18} className="text-red-600" />, bg: 'bg-red-50' };
  }
  return { icon: <Bell size={18} className="text-slate-600" />, bg: 'bg-slate-50' };
};

const NotificationsDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hasReadPermission = user?.permissions?.includes('NOTIFICATION_SELF_READ') || user?.permissions?.includes('NOTIFICATION_READ') || false;

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!hasReadPermission) return;
    try {
      const data = await getMyNotifications();
      const responseData: any = data;

      let extracted: NotificationDTO[] = [];
      if (Array.isArray(responseData)) {
        extracted = responseData;
      } else if (responseData && Array.isArray(responseData.content)) {
        extracted = responseData.content;
      } else if (responseData && responseData.data && Array.isArray(responseData.data.content)) {
        extracted = responseData.data.content;
      }
      setNotifications(extracted);
    } catch (err) {
      console.error('Failed to load notifications', err);
      setNotifications([]);
    }
  }, [hasReadPermission]);

  useEffect(() => {
    if (!hasReadPermission) return;
    void loadNotifications();
    const interval = setInterval(() => void loadNotifications(), 60000);
    return () => clearInterval(interval);
  }, [hasReadPermission, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!hasReadPermission) return null;

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

  const handleNotificationClick = async (notification: NotificationDTO, e: React.MouseEvent) => {
    e.preventDefault();
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    setIsOpen(false);
    
    // Example mapping - navigate to real context links
    if (notification.entityType === 'PROJECT_BRIEF' && notification.entityId) {
      navigate(`/project-briefs/${notification.entityId}`);
    } else if (notification.entityType === 'QUOTATION' && notification.entityId) {
      navigate(`/quotations/${notification.entityId}`);
    } else if (notification.entityType === 'LEAD' && notification.entityId) {
      navigate(`/leads/${notification.entityId}`);
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        <IconButton
          icon={<Bell size={20} />}
          aria-label="View notifications"
          variant="ghost"
          className={unreadCount > 0 ? "text-primary" : "text-gray-500"}
          style={{ pointerEvents: 'none' }} // Let parent div handle click
        />
        {unreadCount > 0 && (
          <span 
            className="absolute top-0 right-0 inline-flex items-center justify-center font-bold text-white bg-red-500 rounded-full"
            style={{ width: '16px', height: '16px', fontSize: '10px', transform: 'translate(25%, -25%)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: '0',
            width: '400px',
            maxWidth: 'calc(100vw - 24px)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'min(480px, calc(100vh - 100px))',
            zIndex: 99999
          }}
        >
          {/* Dropdown Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Notifications</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{unreadCount} unread</span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none', border: 'none', padding: 0, 
                  color: 'var(--color-primary)', fontSize: '12px', fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Scrollable List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {safeNotifications.length === 0 ? (
              <div style={{ height: '190px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Bell size={16} color="var(--color-text-muted)" />
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>You're all caught up</p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>No new notifications right now.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {safeNotifications.map((notification) => {
                  const { icon, bg } = getNotificationIcon(notification.notificationType);
                  return (
                    <div
                      key={notification.id}
                      onClick={(e) => handleNotificationClick(notification, e)}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        gap: '12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: notification.read ? 'var(--color-surface)' : 'var(--color-primary-soft)',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'var(--color-surface-secondary)' : 'var(--color-primary-soft)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'var(--color-surface)' : 'var(--color-primary-soft)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div className={bg} style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {icon}
                        </div>
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: notification.read ? 500 : 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0, marginTop: '4px' }}></div>
                          )}
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', color: notification.read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {notification.message}
                        </p>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {new Date(notification.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dropdown Footer */}
          <div style={{ borderTop: '1px solid var(--color-border)', padding: '0', backgroundColor: 'var(--color-surface)' }}>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              style={{
                width: '100%', background: 'none', border: 'none', padding: '12px',
                fontSize: '13px', fontWeight: 500, color: 'var(--color-primary)', cursor: 'pointer',
                textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              View all notifications <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 640px) {
          div[style*="zIndex: 99999"] {
            position: fixed !important;
            top: 60px !important;
            right: 12px !important;
            width: calc(100vw - 24px) !important;
            max-height: calc(100vh - 80px) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsDropdown;
