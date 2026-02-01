'use client';

import { useEffect, useRef } from 'react';
import { HourBlock } from './HourBlock';
import { useAppStore } from '@/stores/useAppStore';
import { formatDateKey, isToday, getCurrentHour } from '@/lib/date';

export function DayTimeline() {
  const { selectedDate, entries, categories, openInputModal } = useAppStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const currentHourRef = useRef<HTMLDivElement>(null);
  const dateKey = formatDateKey(selectedDate);
  const today = isToday(selectedDate);

  // Scroll to current hour on mount (only for today)
  useEffect(() => {
    if (today && currentHourRef.current) {
      currentHourRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [today, dateKey]);

  // Generate 24 hours
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div
      ref={timelineRef}
      className="flex-1 overflow-y-auto pb-24"
    >
      {hours.map((hour) => {
        const entryKey = `${dateKey}-${hour}`;
        const entry = entries[entryKey];
        const category = entry
          ? categories.find(c => c.id === entry.category_id)
          : undefined;
        const isCurrentHour = today && hour === getCurrentHour();

        return (
          <div
            key={hour}
            ref={isCurrentHour ? currentHourRef : undefined}
          >
            <HourBlock
              hour={hour}
              entry={entry}
              category={category}
              isToday={today}
              onClick={() => openInputModal(hour)}
            />
          </div>
        );
      })}
    </div>
  );
}
