const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.includes('vercel.app') && !host.includes('render.com')) {
      return `http://${host}:5000`;
    }
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
