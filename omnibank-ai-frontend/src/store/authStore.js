import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: sessionStorage.getItem('token') || null,
  isAuthenticated: !!sessionStorage.getItem('token'),
  
  setAuth: (user, token) => {
    sessionStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    sessionStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
