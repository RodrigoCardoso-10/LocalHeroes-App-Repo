import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "../services/api";
// Using SecureStore instead of AsyncStorage for secure storage of sensitive data
import * as SecureStore from "expo-secure-store";

// Define user type
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
  emailVerifiedAt?: string | null;
};

// Define context type
type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!user;

  // Check if user is already logged in and validate with server
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await SecureStore.getItemAsync("user");
        if (userData) {
          // Set the user from storage first for a faster initial load
          setUser(JSON.parse(userData));

          // Then verify with the server that the session is still valid
          try {
            const freshUserData = await authService.checkAuth();
            setUser(freshUserData);
            await SecureStore.setItemAsync(
              "user",
              JSON.stringify(freshUserData)
            );
          } catch (verifyErr) {
            // If server verification fails, log the user out
            console.log("Session expired or invalid, logging out");
            await logout();
          }
        }

        // In loadUser, also load token from SecureStore
        const tokenData = await SecureStore.getItemAsync("accessToken");
        if (tokenData) {
          setToken(tokenData);
        }
      } catch (err: unknown) {
        console.error(
          "Error loading user data:",
          err instanceof Error ? err.message : "Unknown error"
        );
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

      // In login, after successful login, get token from SecureStore
      const storedToken = await SecureStore.getItemAsync("accessToken");
      if (storedToken) {
        setToken(storedToken);
      }

      // After successful login, fetch user data using the auth service
      try {
        const userData = await authService.checkAuth();
        setUser(userData);
        await SecureStore.setItemAsync("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Error fetching user data:", err);
        throw err;
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Starting registration process for:", userData.email);

      // Register the user
      await authService.register(userData);
      console.log("Registration successful, proceeding to login");

      // Add a much longer delay before login attempt to ensure backend has processed the registration
      console.log(
        "Waiting for backend to process registration before login attempt..."
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // After registration, try to log the user in with retry mechanism
      try {
        console.log("Attempting login after registration");
        await login(userData.email, userData.password);
      } catch (loginError) {
        console.log(
          "First login attempt failed, waiting additional time before retry"
        );
        // If first login fails, wait a bit more and try again
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("Retrying login after registration");
        await login(userData.email, userData.password);
      }
    } catch (err: any) {
      console.error("Registration error in AuthContext:", err);

      // Handle different types of error objects
      if (err && typeof err === "object") {
        if (err.message) {
          setError(err.message);
        } else if (typeof err === "string") {
          setError(err);
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
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
      setToken(null);
      await SecureStore.deleteItemAsync("user");
      await SecureStore.deleteItemAsync("token");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  }; // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update profile on server with all the supported fields
      const profileData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        bio: userData.bio,
        skills: userData.skills,
        profilePicture: userData.profilePicture,
      };

      // Filter out undefined values
      const filteredData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== undefined)
      );

      const updatedUser = await authService.updateProfile(filteredData);

      // Update local state
      setUser(updatedUser);
      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      throw err;
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
        token,
        isLoggedIn,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
