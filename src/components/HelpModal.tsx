'use client';

import { X } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/types';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white  rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 ">
          <h2 className="text-lg font-bold text-gray-900 ">How to Use EveryHour</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Start */}
          <section>
            <h3 className="font-semibold text-gray-900 ">Quick Start</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ">
              <li>Click any cell in the grid to log an activity</li>
              <li>Select a category or press a letter key (e.g., S for Sleep)</li>
              <li>Use the Quick buttons at the bottom for fast logging</li>
            </ol>
          </section>

          {/* Views */}
          <section>
            <h3 className="font-semibold text-gray-900 ">Views</h3>
            <ul className="space-y-1 text-sm text-gray-600 ">
              <li><strong>Day:</strong> Single day, 24-hour view</li>
              <li><strong>Week:</strong> 7-day grid (default)</li>
              <li><strong>Month:</strong> Calendar overview with stats</li>
            </ul>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="font-semibold text-gray-900 ">Keyboard Shortcuts</h3>
            <p className="text-sm text-gray-600 ">
              When a cell is selected, press a letter key to quickly assign:
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {DEFAULT_CATEGORIES.map((cat) => (
                <div key={cat.shorthand} className="flex items-center gap-2 py-1">
                  <kbd
                    className="w-6 h-6 flex items-center justify-center rounded text-white font-bold text-[10px]"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.shorthand}
                  </kbd>
                  <span className="text-gray-600 ">{cat.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h3 className="font-semibold text-gray-900 ">Quick Actions</h3>
            <p className="text-sm text-gray-600 ">
              The buttons at the bottom auto-fill the <strong>first empty hour</strong> of today.
              Click multiple times to fill consecutive hours.
            </p>
          </section>

          {/* Tips */}
          <section>
            <h3 className="font-semibold text-gray-900 ">Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ">
              <li>Click the date header to jump to today</li>
              <li>Press <kbd className="px-1 py-0.5 bg-gray-100 ">Backspace</kbd> to clear a cell</li>
              <li>Press <kbd className="px-1 py-0.5 bg-gray-100 ">Esc</kbd> to cancel</li>
              <li>Your data is saved automatically in the browser</li>
              <li>Sign in to sync across devices</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 ">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
