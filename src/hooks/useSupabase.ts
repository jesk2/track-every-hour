'use client';

import { useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { formatDateKey } from '@/lib/date';
import type { Category, TimeEntry } from '@/types';

/**
 * Hook to sync data with Supabase
 * Call this in your root layout or page to enable real-time sync
 */
export function useSupabaseSync() {
  const {
    userId,
    setUserId,
    setCategories,
    setEntriesForDate,
    setEntry,
    removeEntry,
    selectedDate,
    setLoading,
  } = useAppStore();

  // Check auth and load user data
  useEffect(() => {
    const supabase = getSupabaseClient();

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadCategories(user.id);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          await loadCategories(session.user.id);
        } else {
          setUserId(null);
        }
      }
    );

    checkAuth();

    return () => subscription.unsubscribe();
  }, [setUserId, setCategories]);

  // Load categories for user
  const loadCategories = useCallback(async (uid: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', uid)
      .order('sort_order');

    if (!error && data) {
      setCategories(data as Category[]);
    }
  }, [setCategories]);

  // Load entries when date changes
  useEffect(() => {
    if (!userId) return;

    const loadEntries = async () => {
      setLoading(true);
      const supabase = getSupabaseClient();
      const dateKey = formatDateKey(selectedDate);

      const { data, error } = await supabase
        .from('time_entries')
        .select('*, category:categories(*)')
        .eq('user_id', userId)
        .eq('date', dateKey);

      if (!error && data) {
        setEntriesForDate(dateKey, data as TimeEntry[]);
      }
      setLoading(false);
    };

    loadEntries();
  }, [userId, selectedDate, setEntriesForDate, setLoading]);

  // Real-time subscription for entries
  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseClient();
    const dateKey = formatDateKey(selectedDate);

    const channel = supabase
      .channel('entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const entry = payload.new as TimeEntry;
            if (entry.date === dateKey) {
              setEntry(entry);
            }
          }
          if (payload.eventType === 'DELETE') {
            const entry = payload.old as TimeEntry;
            if (entry.date === dateKey) {
              removeEntry(entry.date, entry.hour);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, selectedDate, setEntry, removeEntry]);
}

/**
 * Hook to save an entry to Supabase
 */
export function useSaveEntry() {
  const { userId } = useAppStore();

  return useCallback(async (entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return null;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('time_entries')
      .upsert({
        ...entry,
        user_id: userId,
      }, {
        onConflict: 'user_id,date,hour',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving entry:', error);
      return null;
    }

    return data as TimeEntry;
  }, [userId]);
}

/**
 * Hook to delete an entry from Supabase
 */
export function useDeleteEntry() {
  const { userId } = useAppStore();

  return useCallback(async (date: string, hour: number) => {
    if (!userId) return false;

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('user_id', userId)
      .eq('date', date)
      .eq('hour', hour);

    if (error) {
      console.error('Error deleting entry:', error);
      return false;
    }

    return true;
  }, [userId]);
}
