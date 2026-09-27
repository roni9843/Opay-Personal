import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('opay_merchant_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('opay_merchant_token');
        localStorage.removeItem('opay_merchant_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      } else if (error.response.status === 403) {
        const storedUser = JSON.parse(localStorage.getItem('opay_merchant_user') || '{}');
        storedUser.status = 'suspended';
        localStorage.setItem('opay_merchant_user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event('opay_user_suspended'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
