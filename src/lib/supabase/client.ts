'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Extend session duration to 365 days for "remember me" functionality
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Custom storage to handle longer sessions
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null;
            try {
              return window.localStorage.getItem(key);
            } catch {
              return null;
            }
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return;
            try {
              window.localStorage.setItem(key, value);
            } catch {
              // Handle storage quota exceeded
            }
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return;
            try {
              window.localStorage.removeItem(key);
            } catch {
              // Handle storage errors
            }
          },
        },
      },
    }
  );
}

// Singleton instance for client-side usage
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}
