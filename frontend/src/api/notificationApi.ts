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

export const getMyNotifications = async (): Promise<NotificationDTO[]> => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};
