import client from './client'

export const accountApi = {
  getAccount: () => client.get('/account'),
  getBalance: () => client.get('/account/balance'),
  updateProfile: (data) => client.put('/account/profile', data),
  changePassword: (data) => client.put('/account/password', data),
  updateAvatarColor: (color_hex) => client.put('/account/avatar-color', { color_hex }),
  getActiveUsers: () => client.get('/account/users'),
}
