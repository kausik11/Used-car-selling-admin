import axios from 'axios';

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').trim();
const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');
const apiRoot =
  normalizedBaseUrl.replace(/\/api\/v1$/i, '') || (normalizedBaseUrl.startsWith('/') ? '' : normalizedBaseUrl);

const attachAuthHeader = (config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const token = window.localStorage.getItem('admin_auth_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const api = axios.create({
  baseURL: normalizedBaseUrl || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = axios.create({
  baseURL: `${apiRoot}/api` || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(attachAuthHeader);
authApi.interceptors.request.use(attachAuthHeader);

export default api;
