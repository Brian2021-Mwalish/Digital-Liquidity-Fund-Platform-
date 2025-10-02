// Central fetch with JWT for all API calls
export const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem('access');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
  return fetch(url, { ...options, headers });
};
