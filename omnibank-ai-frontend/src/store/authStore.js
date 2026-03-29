import { create } from 'zustand';
import authService from '../services/authService';

let stored = null;
try {
  stored = JSON.parse(sessionStorage.getItem('omni_user') || 'null');
} catch (err) {
  console.error('Failed to parse auth from storage:', err);
  sessionStorage.removeItem('omni_user');
}

const useAuthStore = create((set) => ({
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

  updateUserAsync: async (updates) => {
    try {
      const state = useAuthStore.getState();
      const token = state.token;
      const response = await authService.updateAgent(updates, token);
      if (response.success) {
        set((state) => {
          const updated = { ...state.user, ...response.agent };
          sessionStorage.setItem('omni_user', JSON.stringify({ user: updated, token }));
          return { user: updated };
        });
        return true;
      }
    } catch (err) {
      console.error('Update failed:', err);
      return false;
    }
  },

  logout: () => {
    sessionStorage.removeItem('omni_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;

