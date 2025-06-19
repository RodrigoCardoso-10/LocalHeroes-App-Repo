import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Dynamically set baseURL for API
let baseURL = 'http://127.0.0.1:3001';
// let baseURL = 'http://kochamcie.duckdns.org:3002'; // Default to production URL
if (Platform.OS === 'android') {
  baseURL = 'http://10.0.2.2:3001'; // Android emulator
  // baseURL = 'http://kochamcie.duckdns.org:3002';
}
// For physical devices, use your machine's LAN IP, e.g. 'http://192.168.1.100:3001'

// Create an axios instance with default configuration
const api = axios.create({
  baseURL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies (JWT tokens)
});

// Add console logging for debugging
console.log('API baseURL:', baseURL);
console.log('Platform:', Platform.OS);

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
      // Enhanced error logging for debugging
      console.log('API Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });

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
  // Deposit funds
  deposit: async (amount: number) => {
    try {
      const response = await api.patch('/users/deposit', { amount });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to deposit funds' };
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

  getTaskById: async (id: string) => {
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
      console.log('Making apply request for task ID:', id);
      // Send an empty body since the endpoint doesn't expect any data
      const response = await api.patch(`/tasks/${id}/apply`, {});
      return response.data;
    } catch (error: any) {
      console.error('Apply for task error:', {
        taskId: id,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error.response?.data || { message: 'Failed to apply for task' };
    }
  },

  getTaskWithApplicants: async (id: string) => {
    try {
      const response = await api.get(`/tasks/${id}/applicants`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch applicants' };
    }
  },
  acceptApplicant: async (taskId: string, applicantId: string) => {
    try {
      console.log('Accepting applicant:', { taskId, applicantId });
      const response = await api.patch(`/tasks/${taskId}/applicants/${applicantId}/accept`, {});
      return response.data;
    } catch (error: any) {
      console.error('Accept applicant error:', {
        taskId,
        applicantId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error.response?.data || { message: 'Failed to accept applicant' };
    }
  },
  denyApplicant: async (taskId: string, applicantId: string) => {
    try {
      console.log('Denying applicant:', { taskId, applicantId });
      const response = await api.patch(`/tasks/${taskId}/applicants/${applicantId}/deny`, {});
      return response.data;
    } catch (error: any) {
      console.error('Deny applicant error:', {
        taskId,
        applicantId,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error.response?.data || { message: 'Failed to deny applicant' };
    }
  },

  completeTask: async (id: string) => {
    try {
      const response = await api.patch(`/tasks/${id}/complete`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to complete task' };
    }
  },

  cancelTask: async (id: string) => {
    try {
      const response = await api.patch(`/tasks/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to cancel task' };
    }
  },

  confirmCompletion: async (id: string) => {
    try {
      const response = await api.patch(`/tasks/${id}/confirm-completion`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to confirm completion' };
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

  // Get user profile by ID or email
  getUserProfile: async (identifier: string) => {
    try {
      console.log('Fetching user profile:', { identifier });

      // Check if the identifier looks like an email
      const isEmail = identifier.includes('@');

      // Use the new backend endpoint for email lookups
      const endpoints = isEmail
        ? [`/users/by-email/${encodeURIComponent(identifier)}`]
        : [`/users/profile/${identifier}`];

      // Try each endpoint until one succeeds
      for (const endpoint of endpoints) {
        try {
          console.log(`Attempting to fetch profile from endpoint: ${endpoint}`);

          const response = await api.get(endpoint, {
            timeout: 10000, // 10-second timeout
            headers: {
              'X-Request-Context': JSON.stringify({
                source: 'mobile-app',
                requestType: isEmail ? 'user-profile-by-email' : 'user-profile-by-id',
                timestamp: new Date().toISOString(),
              }),
            },
          });

          console.log('User profile retrieved successfully:', {
            identifier,
            profileData: {
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              email: response.data.email,
              profileFetchTimestamp: new Date().toISOString(),
            },
          });

          return response.data;
        } catch (endpointError: any) {
          console.warn(`Failed to fetch profile from ${endpoint}:`, {
            errorMessage: endpointError.message,
            errorResponse: endpointError.response?.data,
          });

          // If it's the last endpoint, rethrow the error
          if (endpoint === endpoints[endpoints.length - 1]) {
            throw endpointError;
          }
        }
      }

      // This should never be reached, but TypeScript requires a return
      throw new Error('Unable to retrieve user profile');
    } catch (error: any) {
      console.error('Failed to retrieve user profile:', {
        identifier,
        errorMessage: error.message,
        errorResponse: error.response?.data,
        fullError: JSON.stringify(error, null, 2),
      });

      // More detailed error handling
      if (error.response) {
        // Server responded with an error
        throw new Error(error.response.data?.message || `Failed to retrieve profile. Status: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        throw new Error(`Profile retrieval error: ${error.message}`);
      }
    }
  },
};

export default api;
