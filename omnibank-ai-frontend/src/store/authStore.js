import { create } from 'zustand';

const stored = JSON.parse(sessionStorage.getItem('omni_user') || 'null');

export const useAuthStore = create((set) => ({
  user: stored?.user || null,
  token: stored?.token || null,
  isAuthenticated: !!stored?.token,

  setAuth: (user, token) => {
    sessionStorage.setItem('omni_user', JSON.stringify({ user, token }));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (updates) => {
    set((state) => {
      const updated = { ...state.user, ...updates };
      const token = state.token;
      sessionStorage.setItem('omni_user', JSON.stringify({ user: updated, token }));
      return { user: updated };
    });
  },

  logout: () => {
    sessionStorage.removeItem('omni_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
