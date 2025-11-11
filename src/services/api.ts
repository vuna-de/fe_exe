import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { AuthTokens, ApiError } from '../types';

// Tạo axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api" || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let tokens: AuthTokens | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Set tokens
export const setTokens = (newTokens: AuthTokens | null) => {
  tokens = newTokens;
  
  if (newTokens) {
    localStorage.setItem('tokens', JSON.stringify(newTokens));
    api.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;
  } else {
    localStorage.removeItem('tokens');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Get tokens from localStorage
export const getTokens = (): AuthTokens | null => {
  if (tokens) return tokens;
  
  const storedTokens = localStorage.getItem('tokens');
  if (storedTokens) {
    try {
      const parsedTokens = JSON.parse(storedTokens);
      setTokens(parsedTokens);
      return parsedTokens;
    } catch (error) {
      console.error('Error parsing stored tokens:', error);
      localStorage.removeItem('tokens');
    }
  }
  
  return null;
};

// Clear tokens
export const clearTokens = () => {
  setTokens(null);
};

// Initialize tokens on app start
const initializeTokens = () => {
  const storedTokens = getTokens();
  if (storedTokens) {
    setTokens(storedTokens);
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const currentTokens = getTokens();
    if (currentTokens?.accessToken) {
      config.headers.Authorization = `Bearer ${currentTokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh token, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const currentTokens = getTokens();
      
      if (currentTokens?.refreshToken) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/api/auth/refresh`,
            { refreshToken: currentTokens.refreshToken }
          );
          
          const { accessToken } = response.data;
          const newTokens = { ...currentTokens, accessToken };
          
          setTokens(newTokens);
          processQueue(null, accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearTokens();
          
          // Redirect to login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API error handler
export const handleApiError = (error: any): ApiError => {
  if (error.response?.data) {
    return {
      error: error.response.data.error || 'Đã xảy ra lỗi',
      details: error.response.data.details,
      code: error.response.data.code,
    };
  } else if (error.request) {
    return {
      error: 'Không thể kết nối đến server',
    };
  } else {
    return {
      error: error.message || 'Đã xảy ra lỗi không xác định',
    };
  }
};

// Generic API methods
export const apiRequest = {
  get: <T>(url: string, config = {}) => 
    api.get<T>(url, config).then((response) => response.data),
    
  post: <T>(url: string, data = {}, config = {}) => 
    api.post<T>(url, data, config).then((response) => response.data),
    
  put: <T>(url: string, data = {}, config = {}) => 
    api.put<T>(url, data, config).then((response) => response.data),
    
  patch: <T>(url: string, data = {}, config = {}) => 
    api.patch<T>(url, data, config).then((response) => response.data),
    
  delete: <T>(url: string, config = {}) => 
    api.delete<T>(url, config).then((response) => response.data),
};

// Health check
export const healthCheck = () => apiRequest.get('/health');

// Initialize tokens when module loads
initializeTokens();

export default api;
