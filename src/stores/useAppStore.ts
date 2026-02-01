'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Category, TimeEntry, DEFAULT_CATEGORIES } from '@/types';
import { formatDateKey, getToday } from '@/lib/date';

interface AppState {
  // Selected date for day view
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  // Categories
  categories: Category[];
  categoriesVersion: number;
  setCategories: (categories: Category[]) => void;

  // Time entries (keyed by "YYYY-MM-DD-HH")
  entries: Record<string, TimeEntry>;
  setEntry: (entry: TimeEntry) => void;
  setEntriesForDate: (date: string, entries: TimeEntry[]) => void;
  removeEntry: (date: string, hour: number) => void;
  getEntry: (date: string, hour: number) => TimeEntry | undefined;

  // UI state
  isInputModalOpen: boolean;
  selectedHour: number | null;
  openInputModal: (hour: number) => void;
  closeInputModal: () => void;

  // Loading state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // User ID (for local storage mode before auth)
  userId: string | null;
  setUserId: (id: string | null) => void;
}

// Generate a key for an entry
function entryKey(date: string, hour: number): string {
  return `${date}-${hour}`;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Date
        selectedDate: getToday(),
        setSelectedDate: (date) => set({ selectedDate: date }),

        // Categories - start with defaults
        categories: DEFAULT_CATEGORIES
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((cat, index) => ({
            ...cat,
            id: `default-${index}`,
            user_id: 'local',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })) as Category[],
        categoriesVersion: 10,
        setCategories: (categories) => set({ categories }),

        // Entries
        entries: {},
        setEntry: (entry) => set((state) => {
          const key = entryKey(entry.date, entry.hour);
          return { entries: { ...state.entries, [key]: entry } };
        }),
        setEntriesForDate: (date, entries) => set((state) => {
          const newEntries = { ...state.entries };
          // Clear existing entries for this date
          Object.keys(newEntries).forEach(key => {
            if (key.startsWith(date)) {
              delete newEntries[key];
            }
          });
          // Add new entries
          entries.forEach(entry => {
            const key = entryKey(entry.date, entry.hour);
            newEntries[key] = entry;
          });
          return { entries: newEntries };
        }),
        removeEntry: (date, hour) => set((state) => {
          const key = entryKey(date, hour);
          const newEntries = { ...state.entries };
          delete newEntries[key];
          return { entries: newEntries };
        }),
        getEntry: (date, hour) => {
          const key = entryKey(date, hour);
          return get().entries[key];
        },

        // UI
        isInputModalOpen: false,
        selectedHour: null,
        openInputModal: (hour) => set({ isInputModalOpen: true, selectedHour: hour }),
        closeInputModal: () => set({ isInputModalOpen: false, selectedHour: null }),

        // Loading
        isLoading: false,
        setLoading: (loading) => set({ isLoading: loading }),

        // User
        userId: null,
        setUserId: (id) => set({ userId: id }),
      }),
      {
        name: 'everyhour-storage',
        version: 10,
        migrate: (persistedState: any, version: number) => {
          if (version < 10) {
            // Update categories to new defaults
            persistedState.categories = DEFAULT_CATEGORIES
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((cat, index) => ({
                ...cat,
                id: `default-${index}`,
                user_id: 'local',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }));
            persistedState.categoriesVersion = 10;
          }
          return persistedState;
        },
        partialize: (state) => ({
          entries: state.entries,
          categories: state.categories,
          categoriesVersion: state.categoriesVersion,
          userId: state.userId,
        }),
      }
    )
  )
);
