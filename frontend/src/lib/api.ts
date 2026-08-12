import axios from 'axios';
import { API_URL } from '@/lib/config';

// Create a customized axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Crucial for sending cookies automatically
    headers: {
        'Content-Type': 'application/json',
    }
});

// Response interceptor for handling 401s globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally
        if (error.response && error.response.status === 401) {
            // Check if we are already on the login page to avoid infinite loops
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                // We could dispatch a custom event or just redirect
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
