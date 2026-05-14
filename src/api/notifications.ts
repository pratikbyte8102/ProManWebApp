import { client } from './client';
import type { Notification } from '../types';

export const getNotifications = (unreadOnly = false) =>
  client.get<Notification[]>('/api/notifications', { params: { unreadOnly } }).then(r => r.data);
export const getUnreadCount = () =>
  client.get<{ unreadCount: number }>('/api/notifications/count').then(r => r.data);
export const markRead = (id: string) => client.post(`/api/notifications/${id}/read`);
export const markAllRead = () => client.post('/api/notifications/read-all').then(r => r.data);
