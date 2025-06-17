// local-heroes/services/api.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Dynamically set baseURL for API
let baseURL = 'http://127.0.0.1:3001'; // Default for local machine
if (Platform.OS === 'android') {
  baseURL = 'http://10.0.2.2:3001'; // Android emulator's localhost loopback
}
// For physical devices, use your machine's LAN IP, e.g. 'http://192.168.1.100:3001'
// You should consider using process.env.EXPO_PUBLIC_API_BASE_URL from a .env file for easier management.

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

// Define your Job interface here for consistency across services
// This should match the structure of job objects returned by your backend API
interface Job {
  _id: string;
  title: string;
  description: string;
  location?: string;
  price: number;
  dueDate?: string;
  category?: string;
  tags?: string[];
  experienceLevel?: string;
  status: 'open' | 'pending' | 'closed' | 'active' | 'completed' | 'cancelled';
  // Assuming these fields are present for filtering. Adjust names if different in your backend.
  posterId: string; // The ID of the user who created/posted this job
  assignedTo?: string; // The ID of the user who has accepted/is working on this job
  applicants?: string[]; // Array of user IDs who have applied
  createdAt: string; // Add timestamp if available
  updatedAt: string; // Add timestamp if available
  // ... any other relevant fields from your backend's Job model
}

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
    // Added specific filters for user-related tasks based on backend
    postedBy?: string; // Filter by job poster (matches backend parameter name)
    assignedTo?: string; // Filter by user assigned to the job (active jobs)
    applicantId?: string; // Filter by user who applied (if backend supports this)
  }): Promise<Job[]> => { // Changed return type to Job[]
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
      const response = await api.patch(`/tasks/${id}/apply`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to apply for task' };
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

  // NEW: Method to fetch jobs posted by the current user
  async getMyPostedJobs(userId: string): Promise<Job[]> {
    try {
      // Use getTasks with a filter for the postedBy parameter (matches backend)
      // Backend controller expects 'postedBy' not 'posterId'
      const response = await this.getTasks({ postedBy: userId });
      return response; // getTasks already returns the data directly
    } catch (error: any) {
      // Re-throw the error as getTasks (and its internal Axios call) already handles logging/throwing
      throw error;
    }
  },

  // NEW: Method to fetch jobs actively accepted/assigned to the current user
  async getMyActiveJobs(userId: string): Promise<Job[]> {
    try {
      // Use getTasks with a filter for the assignedTo field and 'active' status
      // This assumes 'assignedTo' holds the user ID of the person working on the job
      const response = await this.getTasks({ assignedTo: userId, status: 'active' });
      return response;
    } catch (error: any) {
      // Re-throw the error
      throw error;
    }
  },
};

export default api;
