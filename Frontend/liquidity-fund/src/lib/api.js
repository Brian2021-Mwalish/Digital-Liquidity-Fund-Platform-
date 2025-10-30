// Base URL from Vite env
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Central fetch with JWT for all API calls
export const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem('access');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
  return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
};
