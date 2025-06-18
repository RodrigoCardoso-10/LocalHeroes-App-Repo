import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Dynamically set baseURL for API
let baseURL = 'http://127.0.0.1:3001';
if (Platform.OS === 'android') {
  baseURL = 'http://10.0.2.2:3001'; // Android emulator
}
// For physical devices, use your machine's LAN IP, e.g. 'http://192.168.1.100:3001'

// Create an axios instance with default configuration
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies (JWT tokens)
});

// Add a request interceptor to add the token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from secure storage
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error adding auth token to request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let responseInterceptorId: number | null = null;

export const setupResponseInterceptor = (logout: () => void) => {
  if (responseInterceptorId !== null) {
    api.interceptors.response.eject(responseInterceptorId);
  }

  responseInterceptorId = api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && originalRequest.url !== '/auth/logout' && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          console.log('Attempting to refresh token at:', `${baseURL}/auth/refresh`);
          const refreshResponse = await axios.post(
            `${baseURL}/auth/refresh`,
            {},
            {
              withCredentials: true,
            }
          );

          if (refreshResponse.data && refreshResponse.data.accessToken) {
            await SecureStore.setItemAsync('accessToken', refreshResponse.data.accessToken);
          }

          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Authentication services
export const authService = {
  // Login user with retry capability
  login: async (email: string, password: string, retryAttempts = 2, initialBackoff = 1000) => {
    let lastError;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`API Service - Login attempt ${attempt + 1}/${retryAttempts + 1} for:`, email);
        console.log('API Service - Making login request to:', `${api.defaults.baseURL}/auth/login`);

        // Add a timeout to the request to avoid hanging indefinitely
        const response = await api.post(
          '/auth/login',
          { email, password },
          {
            timeout: 15000, // Increased timeout
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          }
        );

        console.log('API Service - Login successful, processing response');

        // Store the access token in SecureStore for use in the Authorization header
        if (response.data && response.data.accessToken) {
          await SecureStore.setItemAsync('accessToken', response.data.accessToken);
          console.log('API Service - Access token stored successfully');
        } else {
          console.log('API Service - No access token in response, but request succeeded');
        }

        return response.data;
      } catch (error: any) {
        lastError = error;
        console.error(`API Service - Login attempt ${attempt + 1} failed:`);

        if (error.response) {
          console.error('API Service - Server responded with error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers,
          });
        } else if (error.request) {
          console.error('API Service - No response received:', error.request);
        } else {
          console.error('API Service - Request setup error:', error.message);
        }

        // If this is not the last attempt, wait before retrying
        if (attempt < retryAttempts) {
          const backoffTime = initialBackoff * Math.pow(2, attempt);
          console.log(`API Service - Retrying in ${backoffTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
    }

    // If we've exhausted all retry attempts, throw the last error
    if (lastError?.response?.data) {
      throw lastError.response.data;
    } else if (lastError) {
      throw { message: lastError.message || 'Login failed after multiple attempts' };
    } else {
      throw { message: 'Login failed after multiple attempts' };
    }
  },

  // Register user
  register: async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      console.log('API Service - Registering user:', userData.email);
      // Log the full request payload for debugging (excluding password for security)
      const safeUserData = { ...userData } as Partial<typeof userData>;
      delete safeUserData.password;
      console.log('API Service - Registration payload:', JSON.stringify(safeUserData));
      console.log('API Service - Making request to:', `${api.defaults.baseURL}/users`);
      // Add a timeout to the request to avoid hanging indefinitely
      const response = await api.post('/users', userData, { timeout: 10000 });
      console.log('API Service - Registration successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Service - Registration error:');

      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx range
        console.error('API Service - Server responded with error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
        throw error.response.data || { message: `Server error: ${error.response.status}` };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('API Service - No response received:', error.request);
        throw { message: 'No response from server. Please check your connection and try again.' };
      } else {
        // Something happened in setting up the request
        console.error('API Service - Request setup error:', error.message);
        throw { message: `Request failed: ${error.message}` };
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.delete('/auth/logout');
      await SecureStore.deleteItemAsync('accessToken');
      return response.data;
    } catch (error: any) {
      await SecureStore.deleteItemAsync('accessToken').catch((err) =>
        console.error('Error clearing access token:', err)
      );
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  // Password reset
  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post('/auth/password-reset', { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Password reset request failed' };
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  },

  // User
  checkAuth: async () => {
    try {
      const response = await api.get('/users/userdata');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Authentication check failed' };
    }
  },

  updateProfile: async (profileData: any) => {
    try {
      const response = await api.patch('/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Tasks
  getTasks: async (filters: any) => {
    try {
      const response = await api.get('/tasks', { params: filters });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch tasks' };
    }
  },

  getTask: async (id: string) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch task' };
    }
  },

  createTask: async (taskData: any) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to create task' };
    }
  },

  updateTask: async (id: string, taskData: any) => {
    try {
      const response = await api.patch(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update task' };
    }
  },

  getFilterCounts: async () => {
    try {
      const response = await api.get('/tasks/filter-counts');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch filter counts' };
    }
  },

  deleteTask: async (id: string) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to delete task' };
    }
  },

  applyForTask: async (id: string) => {
    try {
      const response = await api.patch(`/tasks/${id}/apply`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to apply for task' };
    }
  },

  getTaskWithApplicants: async (id: string) => {
    try {
      const response = await api.get(`/tasks/${id}/with-applicants`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to get applicants' };
    }
  },

  acceptApplicant: async (taskId: string, applicantId: string) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/applicants/${applicantId}/accept`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to accept applicant' };
    }
  },

  denyApplicant: async (taskId: string, applicantId: string) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/applicants/${applicantId}/deny`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to deny applicant' };
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to mark notification as read' };
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to mark all notifications as read' };
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to delete notification' };
    }
  },
};

export default api;
