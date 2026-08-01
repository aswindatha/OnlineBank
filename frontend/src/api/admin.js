import client from './client'

export const adminApi = {
  getStats: () => client.get('/admin/stats'),
  getUsers: () => client.get('/admin/users'),
  addUser: (data) => client.post('/admin/users', data),
  updateUser: (id, data) => client.put(`/admin/users/${id}`, data),
  deleteUser: (id) => client.delete(`/admin/users/${id}`),
  toggleStatus: (id, activate) =>
    client.put(`/admin/users/${id}/toggle-status`, { activate }),
  getTransactions: (params) =>
    client.get('/admin/transactions', { params }),
  getMonthlyActivity: (months = 6) =>
    client.get('/admin/monthly-activity', { params: { months } }),
  getRecentActivity: (limit = 10) =>
    client.get('/admin/recent-activity', { params: { limit } }),
}
