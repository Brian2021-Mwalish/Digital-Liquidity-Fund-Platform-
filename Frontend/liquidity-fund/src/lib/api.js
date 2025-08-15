// Central fetch with JWT for all API calls
export const apiFetch = (url, options = {}) => {
  const jwt = localStorage.getItem('jwt');
  const headers = {
    ...(options.headers || {}),
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    'Content-Type': 'application/json',
  };
  return fetch(url, { ...options, headers });
};
