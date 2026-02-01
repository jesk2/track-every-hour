'use client';

import { useAppStore } from '@/stores/useAppStore';
import { formatDateKey, getCurrentHour, isToday } from '@/lib/date';

export function QuickActionBar() {
  const {
    categories,
    selectedDate,
    setEntry,
    entries,
  } = useAppStore();

  const quickActions = categories.filter(c => c.is_quick_action);
  const dateKey = formatDateKey(selectedDate);
  const currentHour = getCurrentHour();
  const today = isToday(selectedDate);

  // Quick log for current hour (or most recent unfilled hour)
  const handleQuickLog = (categoryId: string) => {
    // Find the hour to log (current hour if today, or first unfilled hour)
    let hourToLog = today ? currentHour : 0;

    // If current hour already has an entry, find the next empty one
    const existingEntry = entries[`${dateKey}-${hourToLog}`];
    if (existingEntry) {
      for (let h = 0; h < 24; h++) {
        if (!entries[`${dateKey}-${h}`]) {
          hourToLog = h;
          break;
        }
      }
    }

    const category = categories.find(c => c.id === categoryId);

    setEntry({
      id: `local-${Date.now()}`,
      user_id: 'local',
      category_id: categoryId,
      date: dateKey,
      hour: hourToLog,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: category,
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 ">
      <div className="flex justify-around items-center px-4 py-3">
        {quickActions.map((category) => (
          <button
            key={category.id}
            onClick={() => handleQuickLog(category.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl touch-manipulation active:scale-95 transition-transform hover:bg-gray-50 "
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              {category.shorthand || category.name[0]}
            </div>
            <span className="text-xs text-gray-600 ">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
