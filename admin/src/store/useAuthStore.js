import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('opay_merchant_user')) || null,
  token: localStorage.getItem('opay_merchant_token') || null,
  
  setAuth: (user, token) => {
    localStorage.setItem('opay_merchant_user', JSON.stringify(user));
    localStorage.setItem('opay_merchant_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('opay_merchant_user');
    localStorage.removeItem('opay_merchant_token');
    set({ user: null, token: null });
  },
}));
