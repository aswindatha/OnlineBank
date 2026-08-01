import client from './client'

export const txApi = {
  deposit: (amount, description) =>
    client.post('/transactions/deposit', { amount, description }),

  withdraw: (amount, description) =>
    client.post('/transactions/withdraw', { amount, description }),

  transfer: (receiver_id, amount, remarks) =>
    client.post('/transactions/transfer', { receiver_id, amount, remarks }),

  getTransactions: (params) =>
    client.get('/transactions', { params }),

  getMiniStatement: (limit = 10) =>
    client.get('/transactions/mini-statement', { params: { limit } }),

  getStats: () =>
    client.get('/transactions/stats'),

  getRecentRecipients: () =>
    client.get('/transactions/recent-recipients'),

  getMonthlyActivity: (months = 6) =>
    client.get('/transactions/monthly-activity', { params: { months } }),
}
