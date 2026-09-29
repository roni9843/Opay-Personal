import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('opay_personal_user') || 'null') || null,
  token: localStorage.getItem('opay_personal_token') || null,
  
  setAuth: (user, token) => {
    localStorage.setItem('opay_personal_user', JSON.stringify(user));
    localStorage.setItem('opay_personal_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('opay_personal_user');
    localStorage.removeItem('opay_personal_token');
    set({ user: null, token: null });
  },
}));
