import axios, { InternalAxiosRequestConfig } from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import { storageService } from '../services/storageService';
import store from '../redux/store';
import { setAuthenticated } from '../redux/slices/authSlice';

/** Response structure for token-related API endpoints */
interface TokenResponse {
    access: string;
}

/** Axios instance with predefined baseURL from environment variables */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue to store failed requests during token refresh
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

/**
 * Process all queued requests after token refresh
 * @param error - Optional error to reject all queued requests
 */
const processQueue = (error: any = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If the error is not 401 or the request was to the refresh endpoint, reject immediately
        if (error.response?.status !== 401 || 
            originalRequest.url === '/api/token/refresh/' ||
            originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                return api(originalRequest);
            }).catch((err) => {
                return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
            await storageService.waitForInit();
            const refreshToken = await storageService.storage.get(REFRESH_TOKEN);
            
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post<TokenResponse>('/api/token/refresh/', { 
                refresh: refreshToken 
            });
            
            const newAccessToken = response.data.access;
            await storageService.storage.set(ACCESS_TOKEN, newAccessToken);
            
            // Update authorization header for the original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            processQueue();
            return api(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError);
            // Clear auth state and storage on refresh failure
            store.dispatch(setAuthenticated(false));
            await storageService.storage.clear();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

// Request interceptor to add Authorization header
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        await storageService.waitForInit();
        const token = await storageService.storage.get(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Refreshes the access token using the refresh token
 * @returns Promise resolving to new access token or null if refresh fails
 */
export const refreshToken = async (): Promise<string | null> => {
    try {
        await storageService.waitForInit();
        const refreshToken = await storageService.storage.get(REFRESH_TOKEN);
        
        if (!refreshToken) {
            return null;
        }

        const response = await api.post<TokenResponse>('/api/token/refresh/', { 
            refresh: refreshToken 
        });
        
        if (response.status === 200) {
            const newAccessToken = response.data.access;
            await storageService.storage.set(ACCESS_TOKEN, newAccessToken);
            return newAccessToken;
        }
        
        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
};

/**
 * Checks if a JWT token is expired
 * @param token - JWT token to check
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        return tokenExpiration ? tokenExpiration < now : true;
    } catch {
        return true;
    }
};

/**
 * Verifies if a token is valid by making an API call
 * @param token - Token to verify
 * @returns Promise resolving to boolean indicating if token is valid
 */
export const verifyToken = async (token: string): Promise<boolean> => {
    try {
        const response = await api.post('/api/token/verify/', { token });
        return response.status === 200;
    } catch {
        return false;
    }
};

export default api;
