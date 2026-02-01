'use client';

import { useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { useAuth } from '@/components/AuthProvider';
import { formatDateKey } from '@/lib/date';
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from 'date-fns';
import type { Category, TimeEntry } from '@/types';

/**
 * Hook to sync data with Supabase using custom auth
 */
export function useSupabaseSync() {
  const { user } = useAuth();
  const {
    setUserId,
    setCategories,
    setEntriesBulk,
    setEntry,
    removeEntry,
    selectedDate,
    setLoading,
  } = useAppStore();

  const lastLoadedMonth = useRef<string | null>(null);

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

  // Load entries for a 3-month range around the selected date
  useEffect(() => {
    if (!user) return;

    const currentMonth = format(selectedDate, 'yyyy-MM');

    // Only reload if we haven't loaded this month yet
    if (lastLoadedMonth.current === currentMonth) return;

    const loadEntries = async () => {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Load 3 months of data (previous, current, next)
      const startDate = format(startOfMonth(subMonths(selectedDate, 1)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(addMonths(selectedDate, 1)), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('time_entries')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (!error && data) {
        setEntriesBulk(data as TimeEntry[]);
        lastLoadedMonth.current = currentMonth;
      }
      setLoading(false);
    };

    loadEntries();
  }, [user, selectedDate, setEntriesBulk, setLoading]);

  // Real-time subscription for entries (all user entries, not filtered by date)
  useEffect(() => {
    if (!user) return;

    const supabase = getSupabaseClient();

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
            setEntry(entry);
          }
          if (payload.eventType === 'DELETE') {
            const entry = payload.old as unknown as TimeEntry;
            removeEntry(entry.date, entry.hour);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setEntry, removeEntry]);
}

/**
 * Hook to save an entry to Supabase
 */
export function useSaveEntry() {
  const { user } = useAuth();

  return useCallback(async (entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const supabase = getSupabaseClient();

    // Only include actual database columns, not joined fields like 'category'
    const { data, error } = await supabase
      .from('time_entries')
      .upsert({
        user_id: user.id,
        category_id: entry.category_id,
        date: entry.date,
        hour: entry.hour,
        notes: entry.notes || null,
        custom_label: entry.custom_label || null,
      }, {
        onConflict: 'user_id,date,hour',
      })
      .select('*, category:categories(*)')
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
