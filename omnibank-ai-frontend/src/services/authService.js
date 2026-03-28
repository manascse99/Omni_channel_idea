import api from './apiClient';

const authService = {
  async sendOtp(email) {
    const response = await api.post('/auth/send-otp', { email });
    return response.data; // { success, message, isNewUser }
  },

  async verifyOtp(email, otp, name = null, passkey = null) {
    const response = await api.post('/auth/verify-otp', { email, otp, name, passkey });
    return response.data;
  },

  async updateAgent(data, token) {
    const response = await api.patch('/agents/me', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default authService;
