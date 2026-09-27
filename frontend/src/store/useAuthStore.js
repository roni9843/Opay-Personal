import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('opay_user')) || null,
  token: localStorage.getItem('opay_token') || null,
  isAuthenticated: !!localStorage.getItem('opay_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('opay_token', token);
      localStorage.setItem('opay_user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('opay_token');
    localStorage.removeItem('opay_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data.user;
      localStorage.setItem('opay_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      get().logout();
    }
  },
}));
