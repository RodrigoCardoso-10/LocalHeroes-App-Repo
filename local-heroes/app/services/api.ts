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

// Add a response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If the error is 401 (Unauthorized) and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token - use the same baseURL as the main API instance
        console.log('Attempting to refresh token at:', `${baseURL}/auth/refresh`);
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        // Store the new access token in SecureStore
        if (refreshResponse.data && refreshResponse.data.accessToken) {
          await SecureStore.setItemAsync('accessToken', refreshResponse.data.accessToken);
        }

        // If refresh successful, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login (handled by the auth context)
        console.error('Token refresh failed:', refreshError);
        // Clear the stored token on refresh failure
        await SecureStore.deleteItemAsync('accessToken').catch((err) =>
          console.error('Error clearing access token:', err)
        );
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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

      // Clear the stored access token
      await SecureStore.deleteItemAsync('accessToken');

      return response.data;
    } catch (error: any) {
      console.error('Logout error details:', error);
      // Still try to clear the token even if the server request fails
      await SecureStore.deleteItemAsync('accessToken').catch((err) =>
        console.error('Error clearing access token:', err)
      );

      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post('/auth/password-reset', { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Password reset request failed' };
    }
  },

  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  },
  // Check if user is authenticated
  checkAuth: async () => {
    try {
      const response = await api.get('/users/userdata');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Authentication check failed' };
    }
  }, // Update user profile
  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    bio?: string;
    skills?: string[];
    profilePicture?: string;
  }) => {
    try {
      const response = await api.patch('/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (imageUri: string, fileName: string = 'profile.jpg') => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      const response = await api.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Profile picture upload failed' };
    }
  },
  // Tasks/Jobs API methods

  // Get all tasks with filtering
  getTasks: async (filters?: {
    search?: string;
    location?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    datePosted?: string;
    tags?: string[];
    experienceLevel?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }

      const response = await api.get(`/tasks?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch tasks' };
    }
  },

  // Get filter counts
  getFilterCounts: async () => {
    try {
      const response = await api.get('/tasks/filter-counts');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch filter counts' };
    }
  },

  // Get single task by ID
  getTask: async (id: string) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch task' };
    }
  },

  // Create new task
  createTask: async (taskData: {
    title: string;
    description: string;
    location?: string;
    price: number;
    dueDate?: string;
    category?: string;
    tags?: string[];
    experienceLevel?: string;
  }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to create task' };
    }
  },

  // Update task
  updateTask: async (
    id: string,
    taskData: {
      title?: string;
      description?: string;
      location?: string;
      price?: number;
      dueDate?: string;
      category?: string;
      tags?: string[];
      experienceLevel?: string;
    }
  ) => {
    try {
      const response = await api.patch(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update task' };
    }
  },

  // Delete task
  deleteTask: async (id: string) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to delete task' };
    }
  },
  // Apply for task
  applyForTask: async (id: string) => {
    try {
      console.log('Attempting to apply for task:', {
        taskId: id,
        timestamp: new Date().toISOString(),
        // Add more context
        context: {
          method: 'PATCH',
          endpoint: `/tasks/${id}/apply`
        }
      });

      // Add request timeout and more comprehensive config
      const response = await api.patch(`/tasks/${id}/apply`, {}, {
        timeout: 15000, // 15-second timeout
        headers: {
          'X-Application-Context': JSON.stringify({
            source: 'mobile-app',
            version: '1.0.0',
            timestamp: new Date().toISOString()
          }),
          // Add more diagnostic headers
          'X-Diagnostic-Request-ID': `apply-${id}-${Date.now()}`
        },
        // Add more robust error handling
        validateStatus: (status) => status >= 200 && status < 300
      });
      
      console.log('Task application successful:', {
        taskId: id,
        responseStatus: response.status,
        responseData: response.data
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Apply for task error:', {
        taskId: id,
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
        errorResponse: error?.response?.data,
        errorStatus: error?.response?.status,
        requestConfig: error?.config,
        responseData: error?.response?.data,
        responseHeaders: error?.response?.headers,
        responseStatus: error?.response?.status,
        timestamp: new Date().toISOString()
      });

      // More granular error handling
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        throw {
          message: error.response.data?.message || 'Failed to apply for task',
          status: error.response.status,
          details: error.response.data
        };
      } else if (error.request) {
        // The request was made but no response was received
        throw {
          message: 'No response received from server. Please check your connection.',
          type: 'network_error'
        };
      } else {
        // Something happened in setting up the request
        throw {
          message: `Request setup error: ${error.message}`,
          type: 'request_setup_error'
        };
      }
    }
  },

  // Accept applicant (for job posters)
  acceptApplicant: async (id: string, applicantId: string) => {
    try {
      const response = await api.patch(`/tasks/${id}/accept-applicant`, { applicantId });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to accept applicant' };
    }
  },

  // Accept task
  acceptTask: async (id: string) => {
    try {
      const response = await api.patch(`/tasks/${id}/accept`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to accept task' };
    }
  },

  // Complete task
  completeTask: async (id: string) => {
    try {
      const response = await api.patch(`/tasks/${id}/complete`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to complete task' };
    }
  },

  // Cancel task
  cancelTask: async (id: string) => {
    try {
      const response = await api.patch(`/tasks/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to cancel task' };
    }
  },

  // Notifications API methods
  getNotifications: async (limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/notifications?limit=${limit}&offset=${offset}`);
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
      const response = await api.patch('/notifications/mark-all-read');
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
      
      // Array of possible endpoints to try
      const endpoints = isEmail 
        ? [
            `/users/profile?email=${encodeURIComponent(identifier)}`,
            `/users/profile/email/${encodeURIComponent(identifier)}`,
            `/users/by-email/${encodeURIComponent(identifier)}`
          ]
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
                timestamp: new Date().toISOString()
              })
            }
          });
          
          console.log('User profile retrieved successfully:', {
            identifier,
            profileData: {
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              email: response.data.email,
              profileFetchTimestamp: new Date().toISOString()
            }
          });
          
          return response.data;
        } catch (endpointError: any) {
          console.warn(`Failed to fetch profile from ${endpoint}:`, {
            errorMessage: endpointError.message,
            errorResponse: endpointError.response?.data
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
        fullError: JSON.stringify(error, null, 2)
      });
      
      // More detailed error handling
      if (error.response) {
        // Server responded with an error
        throw new Error(
          error.response.data?.message || 
          `Failed to retrieve profile. Status: ${error.response.status}`
        );
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
