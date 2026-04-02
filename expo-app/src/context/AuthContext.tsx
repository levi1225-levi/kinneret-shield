import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import * as authAPI from '../api/auth';

// Context type definition
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (googleIdToken: string) => Promise<void>;
  register: (data: authAPI.RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component that wraps the app and manages authentication state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Try to retrieve stored token
        const storedToken = await SecureStore.getItemAsync('auth_token');

        if (storedToken) {
          setToken(storedToken);

          // Try to get current user
          try {
            const currentUser = await authAPI.getMe();
            setUser(currentUser);
          } catch (error) {
            // Token is invalid, clear it
            console.error('Failed to fetch user with stored token:', error);
            await SecureStore.deleteItemAsync('auth_token');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login with Google ID token
   */
  const login = useCallback(async (googleIdToken: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(googleIdToken);

      // Store token
      await SecureStore.setItemAsync(
        'auth_token',
        response.token.accessToken
      );

      // Update state
      setToken(response.token.accessToken);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(async (data: authAPI.RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);

      // Store token
      await SecureStore.setItemAsync(
        'auth_token',
        response.token.accessToken
      );

      // Update state
      setToken(response.token.accessToken);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout and clear auth state
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Clear stored token
      await SecureStore.deleteItemAsync('auth_token');

      // Clear state
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh current user information
   */
  const refreshUser = useCallback(async () => {
    try {
      if (!token) return;

      const currentUser = await authAPI.getMe();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If getting user fails, logout
      await logout();
      throw error;
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
