import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { DEMO_USERS } from '../utils/mockData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check for existing Supabase session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('Error retrieving session:', error);
          setSession(null);
          setUser(null);
          return;
        }

        if (data?.session) {
          setSession(data.session);

          // Fetch the user profile from the users table
          await fetchUserProfile(data.session.user.id);
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change:', event);

        if (event === 'SIGNED_IN' && currentSession) {
          setSession(currentSession);
          await fetchUserProfile(currentSession.user.id);
          setIsDemoMode(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsDemoMode(false);
        } else if (event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
        }
      }
    );

    // Cleanup subscription
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) {
        console.warn('Error fetching user profile:', error);
        setUser(null);
        return;
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          avatar_url: data.avatar_url,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error(error.message);
      }

      if (data?.session) {
        setSession(data.session);
        await fetchUserProfile(data.session.user.id);
        setIsDemoMode(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginDemo = useCallback(() => {
    try {
      setIsLoading(true);

      const demoUser = DEMO_USERS.management;

      setUser(demoUser);
      setSession(null);
      setIsDemoMode(true);
    } catch (error) {
      console.error('Demo login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!isDemoMode) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('Sign out error:', error);
        }
      }

      setSession(null);
      setUser(null);
      setIsDemoMode(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  const refreshUser = useCallback(async () => {
    try {
      if (isDemoMode) {
        return;
      }

      if (!session?.user?.id) {
        return;
      }

      await fetchUserProfile(session.user.id);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, [session?.user?.id, isDemoMode]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isDemoMode,
    login,
    loginDemo,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
