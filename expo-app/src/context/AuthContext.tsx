import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, UserRole } from '../types';
import * as authAPI from '../api/auth';
import { DEMO_USERS } from '../utils/mockData';

// Context type definition
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (googleIdToken: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
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
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Try to retrieve stored token
        const storedToken = await SecureStore.getItemAsync('auth_token');

        if (storedToken) {
          // Check if it's a demo token
          if (storedToken.startsWith('demo-token-')) {
            const role = storedToken.replace('demo-token-', '').split('-')[0] as UserRole;
            if (DEMO_USERS[role]) {
              setToken(storedToken);
              setUser(DEMO_USERS[role]);
              setIsDemoMode(true);
              return;
            }
          }

          setToken(storedToken);

          // Try to get current user from API
          try {
            const currentUser = await authAPI.getMe();
            setUser(currentUser);
          } catch (error) {
            // Token is invalid, clear it
            console.log('No backend available, clearing stored token');
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
   * Demo login — sets mock user data directly without API call
   */
  const demoLogin = useCallback(async (role: UserRole) => {
    try {
      setIsLoading(true);
      const demoUser = DEMO_USERS[role];
      const demoToken = `demo-token-${role}-${Date.now()}`;

      // Store token for session persistence
      await SecureStore.setItemAsync('auth_token', demoToken);

      // Update state
      setToken(demoToken);
      setUser(demoUser);
      setIsDemoMode(true);
    } catch (error) {
      console.error('Demo login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
      setIsDemoMode(false);
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
      setIsDemoMode(false);
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
      setIsDemoMode(false);
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

      // In demo mode, just keep the current user
      if (isDemoMode) return;

      const currentUser = await authAPI.getMe();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If getting user fails, logout
      await logout();
      throw error;
    }
  }, [token, isDemoMode]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    isDemoMode,
    login,
    demoLogin,
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
