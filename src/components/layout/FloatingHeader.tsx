'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { formatDateDisplay, getNextDay, getPrevDay, isToday, getToday } from '@/lib/date';
import { ExportModal } from '../ExportModal';

export function FloatingHeader() {
  const { selectedDate, setSelectedDate, categories } = useAppStore();
  const isTodaySelected = isToday(selectedDate);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 ">
        {/* Date navigation */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSelectedDate(getPrevDay(selectedDate))}
            className="p-2 -ml-2 touch-manipulation rounded-full hover:bg-gray-100 "
            aria-label="Previous day"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {formatDateDisplay(selectedDate)}
            </h1>
            <div className="flex items-center gap-1">
              {!isTodaySelected && (
                <button
                  onClick={() => setSelectedDate(getToday())}
                  className="px-2 py-1 text-xs font-medium text-blue-600 "
                >
                  Today
                </button>
              )}
              <button
                onClick={() => setShowExportModal(true)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export data"
                aria-label="Export your data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setSelectedDate(getNextDay(selectedDate))}
            className="p-2 -mr-2 touch-manipulation rounded-full hover:bg-gray-100 "
            aria-label="Next day"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Category legend - horizontal scroll */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {categories.slice(0, 8).map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full shrink-0"
              style={{ backgroundColor: `${category.color}15` }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: category.color }}
              >
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </header>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
}
