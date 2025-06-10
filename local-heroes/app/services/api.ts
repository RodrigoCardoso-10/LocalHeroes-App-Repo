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
  // Login user
  login: async (email: string, password: string) => {
    try {
      console.log('API Service - Login attempt for:', email);
      console.log('API Service - Making login request to:', `${api.defaults.baseURL}/auth/login`);
      
      // Add a timeout to the request to avoid hanging indefinitely
      const response = await api.post('/auth/login', { email, password }, { timeout: 10000 });
      
      console.log('API Service - Login successful, processing response');
      
      // Store the access token in SecureStore for use in the Authorization header
      if (response.data && response.data.accessToken) {
        await SecureStore.setItemAsync('accessToken', response.data.accessToken);
        console.log('API Service - Access token stored successfully');
      } else {
        console.log('API Service - No access token in response');
      }

      return response.data;
    } catch (error: any) {
      console.error('API Service - Login error:');
      
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx range
        console.error('API Service - Server responded with error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
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
  },
};

export default api;
