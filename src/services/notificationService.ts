import { apiRequest } from './api';

export interface NotificationItem {
  _id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'payment' | 'workout' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export const notificationService = {
  list: async (skip = 0, limit = 20): Promise<{ notifications: NotificationItem[]; total: number; unread: number }> => {
    return apiRequest.get(`/notifications?skip=${skip}&limit=${limit}`);
  },
  markRead: async (id: string): Promise<{ message: string; notification: NotificationItem }> => {
    return apiRequest.post(`/notifications/${id}/read`, {});
  },
  markAllRead: async (): Promise<{ message: string }> => {
    return apiRequest.post(`/notifications/read-all`, {});
  },
};


