import { supabase } from '../lib/supabase';
import { User } from '../types';

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Get the current session
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return data.session;
};

/**
 * Get current user profile from users table
 */
export const getMe = async (): Promise<User | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', sessionData.session.user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
