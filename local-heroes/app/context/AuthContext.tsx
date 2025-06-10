import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';
// Using SecureStore instead of AsyncStorage for secure storage of sensitive data
import * as SecureStore from 'expo-secure-store';

// Define user type
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

// Define context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in and validate with server
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          // Set the user from storage first for a faster initial load
          setUser(JSON.parse(userData));

          // Then verify with the server that the session is still valid
          try {
            const freshUserData = await authService.checkAuth();
            setUser(freshUserData);
            await SecureStore.setItemAsync('user', JSON.stringify(freshUserData));
          } catch (verifyErr) {
            // If server verification fails, log the user out
            console.log('Session expired or invalid, logging out');
            await logout();
          }
        }
      } catch (err: unknown) {
        console.error('Error loading user data:', err instanceof Error ? err.message : 'Unknown error');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Login to get tokens (stored in cookies)
      await authService.login(email, password);

      // After successful login, fetch user data using the auth service
      try {
        const userData = await authService.checkAuth();
        setUser(userData);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
      } catch (err) {
        console.error('Error fetching user data:', err);
        throw err;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting registration process for:', userData.email);

      // Register the user
      await authService.register(userData);
      console.log('Registration successful, proceeding to login');

      // Add a much longer delay before login attempt to ensure backend has processed the registration
      console.log('Waiting for backend to process registration before login attempt...');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // After registration, try to log the user in with retry mechanism
      try {
        console.log('Attempting login after registration');
        await login(userData.email, userData.password);
      } catch (loginError) {
        console.log('First login attempt failed, waiting additional time before retry');
        // If first login fails, wait a bit more and try again
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log('Retrying login after registration');
        await login(userData.email, userData.password);
      }
    } catch (err: any) {
      console.error('Registration error in AuthContext:', err);

      // Handle different types of error objects
      if (err && typeof err === 'object') {
        if (err.message) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      await SecureStore.deleteItemAsync('user');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
