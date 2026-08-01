import client from './client'

export const notifApi = {
  getNotifications: (unread_only = false) =>
    client.get('/notifications', { params: { unread_only } }),

  getUnreadCount: () =>
    client.get('/notifications/unread-count'),

  markRead: (id) =>
    client.put(`/notifications/${id}/read`),

  markAllRead: () =>
    client.put('/notifications/read-all'),
}
