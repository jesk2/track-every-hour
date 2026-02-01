'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { DEFAULT_CATEGORIES } from '@/types';

interface LocalUser {
  id: string;
  username: string;
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'everyhour-auth';

// Simple hash function for password (not cryptographically secure, but fine for personal use)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function getCurrentUser(): LocalUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

function saveCurrentUser(user: LocalUser | null): void {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = getCurrentUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const supabase = getSupabaseClient();
      const passwordHash = simpleHash(password);

      // Query users table
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username.toLowerCase())
        .eq('password_hash', passwordHash)
        .single();

      if (error || !data) {
        return { error: new Error('Invalid username or password') };
      }

      const localUser: LocalUser = {
        id: data.id,
        username: data.username,
      };

      saveCurrentUser(localUser);
      setUser(localUser);
      return { error: null };
    } catch {
      return { error: new Error('Failed to sign in. Please try again.') };
    }
  };

  const signUp = async (username: string, password: string) => {
    try {
      const supabase = getSupabaseClient();
      const passwordHash = simpleHash(password);
      const lowerUsername = username.toLowerCase();

      // Check if username exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', lowerUsername)
        .single();

      if (existing) {
        return { error: new Error('Username already exists') };
      }

      // Create user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username: lowerUsername,
          display_name: username,
          password_hash: passwordHash,
        })
        .select('id, username')
        .single();

      if (createError || !newUser) {
        console.error('Create user error:', createError);
        return { error: new Error('Failed to create account') };
      }

      // Create default categories for the new user
      const defaultCategories = DEFAULT_CATEGORIES.map((cat, index) => ({
        user_id: newUser.id,
        name: cat.name,
        shorthand: cat.shorthand,
        numeric_id: cat.numeric_id,
        color: cat.color,
        icon: cat.icon,
        is_productive: cat.is_productive,
        is_quick_action: cat.is_quick_action,
        sort_order: index,
      }));

      await supabase.from('categories').insert(defaultCategories);

      // Auto sign in
      const localUser: LocalUser = {
        id: newUser.id,
        username: newUser.username,
      };
      saveCurrentUser(localUser);
      setUser(localUser);

      return { error: null };
    } catch (err) {
      console.error('Signup error:', err);
      return { error: new Error('Failed to create account. Please try again.') };
    }
  };

  const signOut = async () => {
    saveCurrentUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
