'use client';

import { useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { useAuth } from '@/components/AuthProvider';
import { formatDateKey } from '@/lib/date';
import type { Category, TimeEntry } from '@/types';

/**
 * Hook to sync data with Supabase using custom auth
 */
export function useSupabaseSync() {
  const { user } = useAuth();
  const {
    setUserId,
    setCategories,
    setEntriesForDate,
    setEntry,
    removeEntry,
    selectedDate,
    setLoading,
  } = useAppStore();

  // Update store userId when auth changes
  useEffect(() => {
    if (user) {
      setUserId(user.id);
    } else {
      setUserId(null);
    }
  }, [user, setUserId]);

  // Load categories when user changes
  useEffect(() => {
    if (!user) return;

    const loadCategories = async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order');

      if (!error && data) {
        setCategories(data as Category[]);
      }
    };

    loadCategories();
  }, [user, setCategories]);

  // Load entries when date or user changes
  useEffect(() => {
    if (!user) return;

    const loadEntries = async () => {
      setLoading(true);
      const supabase = getSupabaseClient();
      const dateKey = formatDateKey(selectedDate);

      const { data, error } = await supabase
        .from('time_entries')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .eq('date', dateKey);

      if (!error && data) {
        setEntriesForDate(dateKey, data as TimeEntry[]);
      }
      setLoading(false);
    };

    loadEntries();
  }, [user, selectedDate, setEntriesForDate, setLoading]);

  // Real-time subscription for entries
  useEffect(() => {
    if (!user) return;

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
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const entry = payload.new as unknown as TimeEntry;
            if (entry.date === dateKey) {
              setEntry(entry);
            }
          }
          if (payload.eventType === 'DELETE') {
            const entry = payload.old as unknown as TimeEntry;
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
  }, [user, selectedDate, setEntry, removeEntry]);
}

/**
 * Hook to save an entry to Supabase
 */
export function useSaveEntry() {
  const { user } = useAuth();

  return useCallback(async (entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('time_entries')
      .upsert({
        ...entry,
        user_id: user.id,
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
  }, [user]);
}

/**
 * Hook to delete an entry from Supabase
 */
export function useDeleteEntry() {
  const { user } = useAuth();

  return useCallback(async (date: string, hour: number) => {
    if (!user) return false;

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date)
      .eq('hour', hour);

    if (error) {
      console.error('Error deleting entry:', error);
      return false;
    }

    return true;
  }, [user]);
}
