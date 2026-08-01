import client from './client'

export const authApi = {
  login: (username, password) =>
    client.post('/auth/login', { username, password }),

  register: (data) =>
    client.post('/auth/register', data),

  forgotPassword: (username, email) =>
    client.post('/auth/forgot-password', { username, email }),

  loginHistory: () =>
    client.get('/auth/login-history'),

  logout: () =>
    client.post('/auth/logout'),
}
