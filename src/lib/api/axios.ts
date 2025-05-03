import axios, { isAxiosError } from 'axios';

// Create a base axios instance 
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Response interceptor for handling errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle expired tokens or authentication errors
    if (error.response?.status === 401) {
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    
    // Centralized error handling
    console.error('API Error:', error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

export { isAxiosError };
export default api; 