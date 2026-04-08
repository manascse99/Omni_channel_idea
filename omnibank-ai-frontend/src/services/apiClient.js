import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  let token = null;
  try {
    const stored = JSON.parse(sessionStorage.getItem('omni_user') || 'null');
    token = stored?.token;
  } catch (err) {
    console.error('Auth Interceptor Error:', err);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('omni_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
