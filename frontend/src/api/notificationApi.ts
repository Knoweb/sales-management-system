import { apiClient as api } from '../services/Api';

export interface NotificationDTO {
  id: string;
  notificationType: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreferenceDTO {
  id: string;
  notificationType: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
}

export const getMyNotifications = async (): Promise<NotificationDTO[]> => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};

export const getMyNotificationPreferences = async (): Promise<NotificationPreferenceDTO[]> => {
  const response = await api.get('/notifications/preferences');
  return response.data;
};

export const updateNotificationPreference = async (id: string, inAppEnabled: boolean, emailEnabled: boolean): Promise<NotificationPreferenceDTO> => {
  const response = await api.put(`/notifications/preferences/${id}`, { inAppEnabled, emailEnabled });
  return response.data;
};
