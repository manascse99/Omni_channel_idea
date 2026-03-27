import { create } from 'zustand';
import api from '../services/apiClient';

const useSettingsStore = create((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/settings');
      if (response.data.success) {
        set({ settings: response.data.settings, loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateSettings: async (updates) => {
    set({ loading: true });
    try {
      const response = await api.post('/settings', updates);
      if (response.data.success) {
        set({ settings: response.data.settings, loading: false });
        return true;
      }
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  }
}));

export default useSettingsStore;
