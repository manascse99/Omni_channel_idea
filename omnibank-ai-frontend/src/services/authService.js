import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const authService = {
  sendOtp: async (phone) => {
    // Mock implementation for frontend-only phase
    console.log(`[Mock API] Sending OTP to ${phone}`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
    
    // Real implementation
    // return axios.post(`${API_URL}/auth/send-otp`, { phone });
  },
  verifyOtp: async (phone, otp) => {
    // Mock implementation for frontend-only phase
    console.log(`[Mock API] Verifying OTP ${otp} for ${phone}`);
    return new Promise(resolve => setTimeout(() => resolve({ 
      data: {
        token: 'mock-jwt-token-123', 
        user: { id: 1, name: 'Marcus Chen', role: 'Senior Agent', avatar: 'MC' }
      }
    }), 1000));
    
    // Real implementation
    // return axios.post(`${API_URL}/auth/verify-otp`, { phone, otp });
  }
};
