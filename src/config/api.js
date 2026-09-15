const PROD_API_URL = 'https://nepal-momo-house-api.onrender.com';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    // Deployed domain (e.g. *.vercel.app, *.onrender.com, custom domain) defaults to production backend URL
    return PROD_API_URL;
  }
  if (import.meta.env.PROD) {
    return PROD_API_URL;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
