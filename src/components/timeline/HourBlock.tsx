'use client';

import { TimeEntry, Category } from '@/types';
import { formatHour, getCurrentHour } from '@/lib/date';

interface HourBlockProps {
  hour: number;
  entry?: TimeEntry;
  category?: Category;
  isToday: boolean;
  onClick: () => void;
}

export function HourBlock({ hour, entry, category, isToday, onClick }: HourBlockProps) {
  const currentHour = getCurrentHour();
  const isCurrentHour = isToday && hour === currentHour;
  const hasEntry = !!entry && !!category;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 min-h-16 w-full text-left
        border-b border-gray-100 
        touch-manipulation transition-all duration-150
        ${isCurrentHour ? 'bg-blue-50' : ''}
        ${!hasEntry ? 'hover:bg-gray-50' : ''}
        active:scale-[0.99]
      `}
    >
      {/* Hour label */}
      <div className={`
        w-14 text-sm font-medium shrink-0
        ${isCurrentHour ? 'text-blue-600' : ''}
      `}>
        {formatHour(hour)}
      </div>

      {/* Entry content or ghost */}
      <div className="flex-1">
        {hasEntry ? (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <span
              className="font-medium text-sm"
              style={{ color: category.color }}
            >
              {category.name}
            </span>
            {entry.notes && (
              <span className="text-xs text-gray-500 truncate">
                {entry.notes}
              </span>
            )}
          </div>
        ) : (
          <div className={`
            flex items-center justify-center h-10 rounded-lg border-2 border-dashed
            ${isCurrentHour ? 'border-blue-300' : 'border-gray-200'}
          `}>
            <span className="text-xs text-gray-400">
              {isCurrentHour ? 'Log now' : 'Tap to log'}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
