import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
export const SERVER_URL = import.meta.env.VITE_SERVER_URL;
cnsole.log('API_UR');
const api = axios.create({ baseURL: API_URL });

// Attach the JWT (stored in localStorage) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('propchat_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log the user out if the token is rejected
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/');
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('propchat_token');
      localStorage.removeItem('propchat_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/** Extracts a readable message from an Axios error. */
export const errorMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || err?.message || fallback;

/** Turns a stored "/uploads/..." path into a full URL. */
export const fileUrl = (path) => {
  if (!path) return '';
  return /^https?:\/\//.test(path) ? path : `${SERVER_URL}${path}`;
};

export default api;
