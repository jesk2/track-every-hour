'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { formatDateKey, formatHour, getCurrentHour, isToday } from '@/lib/date';
import {
  format,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  parseISO,
} from 'date-fns';
import { X, HelpCircle, User, LogOut, Calendar, Download } from 'lucide-react';
import type { Category, ViewType } from '@/types';
import { HelpModal } from './HelpModal';
import { AuthModal } from './AuthModal';
import { useAuth } from './AuthProvider';

export function SpreadsheetView() {
  const {
    entries,
    categories,
    setEntry,
    removeEntry,
    selectedDate,
    setSelectedDate,
  } = useAppStore();

  const { user, signOut, loading: authLoading } = useAuth();

  const [view, setView] = useState<ViewType>('week');
  const [selectedCell, setSelectedCell] = useState<{ date: string; hour: number } | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [showExportOptions, setShowExportOptions] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Get dates based on view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowCategoryPicker(false);
        setSelectedCell(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for quick entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !showCategoryPicker) return;

      const key = e.key.toUpperCase();
      const category = categories.find(c => c.shorthand === key);
      if (category) {
        handleCategorySelect(category);
      } else if (e.key === 'Escape') {
        setShowCategoryPicker(false);
        setSelectedCell(null);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClearCell();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, showCategoryPicker, categories]);

  const handleCellClick = (date: string, hour: number) => {
    if (selectedCategory) {
      // Fill the cell with selected category
      setEntry({
        id: 'local-' + Date.now(),
        user_id: 'local',
        category_id: selectedCategory.id,
        date,
        hour,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: selectedCategory,
      });
    } else {
      // Open category picker
      setSelectedDate(parseISO(date));
      setSelectedCell({ date, hour });
      setShowCategoryPicker(true);
    }
  };

  const handleCategorySelect = (category: Category) => {
    if (!selectedCell) return;

    setEntry({
      id: 'local-' + Date.now(),
      user_id: 'local',
      category_id: category.id,
      date: selectedCell.date,
      hour: selectedCell.hour,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: category,
    });

    setSelectedCategory(category); // Keep category selected for painting
    setShowCategoryPicker(false);
    setSelectedCell(null);
  };

  const handleClearCell = () => {
    if (!selectedCell) return;
    removeEntry(selectedCell.date, selectedCell.hour);
    setShowCategoryPicker(false);
    setSelectedCell(null);
  };

  // Quick log - select category for painting cells
  const handleQuickLog = (category: Category) => {
    setSelectedCategory(selectedCategory?.id === category.id ? null : category);
  };

  // Export data as CSV
  const exportData = () => {
    const yearStart = new Date(exportYear, 0, 1);
    const yearEnd = new Date(exportYear, 11, 31);
    const yearDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

    const csvData = [
      ['Date', 'Hour', 'Category', 'Category ID', 'Category Color', 'Shorthand', 'Created At', 'Updated At']
    ];

    yearDays.forEach(day => {
      const dateKey = formatDateKey(day);
      hours.forEach(hour => {
        const entry = entries[dateKey + '-' + hour];
        if (entry?.category) {
          csvData.push([
            format(day, 'yyyy-MM-dd'),
            hour.toString(),
            entry.category.name,
            entry.category.id,
            entry.category.color,
            entry.category.shorthand ?? '',
            entry.created_at,
            entry.updated_at
          ]);
        }
      });
    });

    // Convert to CSV string
    const csvContent = csvData.map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `everyhour-${exportYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate stats for the current view period
  const getStats = () => {
    const stats: Record<string, number> = {};
    const days = view === 'day' ? [selectedDate] : view === 'week' ? weekDays : monthDays;

    days.forEach(day => {
      const dateKey = formatDateKey(day);
      hours.forEach(hour => {
        const entry = entries[dateKey + '-' + hour];
        if (entry?.category) {
          stats[entry.category.name] = (stats[entry.category.name] || 0) + 1;
        }
      });
    });
    return stats;
  };

  const stats = getStats();
  const totalLogged = Object.values(stats).reduce((a, b) => a + b, 0);

  // Get navigation label
  const getNavLabel = () => {
    if (view === 'day') {
      return format(selectedDate, 'EEEE, MMM d, yyyy');
    } else if (view === 'week') {
      return format(weekStart, 'MMM d') + ' - ' + format(addDays(weekStart, 6), 'MMM d, yyyy');
    }
    return format(selectedDate, 'MMMM yyyy');
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">EveryHour</h1>
              <button
                onClick={() => setShowHelp(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Help"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Date Controls */}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={format(selectedDate, 'MM')}
                onChange={(e) => {
                  const newMonth = parseInt(e.target.value);
                  const newDate = new Date(selectedDate.getFullYear(), newMonth - 1, Math.min(selectedDate.getDate(), new Date(selectedDate.getFullYear(), newMonth, 0).getDate()));
                  setSelectedDate(newDate);
                }}
                className="font-medium text-gray-700 bg-transparent border border-gray-200 rounded-md px-2 py-1 text-sm outline-none cursor-pointer hover:border-gray-300 transition-colors"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  return (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {format(new Date(2024, i, 1), 'MMM')}
                    </option>
                  );
                })}
              </select>
              <select
                value={selectedDate.getDate()}
                onChange={(e) => {
                  const newDay = parseInt(e.target.value);
                  const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), newDay);
                  setSelectedDate(newDate);
                }}
                className="font-medium text-gray-700 bg-transparent border border-gray-200 rounded-md px-2 py-1 text-sm outline-none cursor-pointer hover:border-gray-300 transition-colors w-16"
              >
                {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                  const day = i + 1;
                  return (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  );
                })}
              </select>
              <select
                value={selectedDate.getFullYear()}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value);
                  const newDate = new Date(newYear, selectedDate.getMonth(), Math.min(selectedDate.getDate(), new Date(newYear, selectedDate.getMonth() + 1, 0).getDate()));
                  setSelectedDate(newDate);
                }}
                className="font-medium text-gray-700 bg-transparent border border-gray-200 rounded-md px-2 py-1 text-sm outline-none cursor-pointer hover:border-gray-300 transition-colors w-20"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
              title="Go to today"
            >
              <Calendar className="w-4 h-4" />
              Today
            </button>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month'] as ViewType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={"px-3 py-1.5 text-sm font-medium rounded-md transition-colors" + (view === v ? ' bg-white text-gray-900 shadow-sm' : ' text-gray-700 hover:text-gray-900')}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            {user ? (
              <div className="flex items-center gap-1">
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-xs text-green-600 font-medium">✓ Saved</span>
                  <span className="text-xs text-gray-500 max-w-[80px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={() => setShowExportOptions(true)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Export Data"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Quick Actions Bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-0.5">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {categories
            .filter(c => c.is_quick_action)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((category) => (
              <button
                key={category.id}
                onClick={() => handleQuickLog(category)}
                className={"flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0 hover:opacity-80 active:scale-95 transition-all border-2" + (selectedCategory?.id === category.id ? ' brightness-150 scale-110 border-white shadow-lg' : ' border-transparent')}
                style={{ backgroundColor: category.color }}
              >
                <span className="text-white font-bold text-lg">{category.shorthand}</span>
                <span className="text-white/90 text-sm">{category.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          {view === 'month' ? (
            <MonthView
              monthDays={monthDays}
              entries={entries}
              categories={categories}
              selectedDate={selectedDate}
            />
          ) : (
            <>
              {/* Spreadsheet Grid */}
              <div className="h-full overflow-auto">
              <table className="w-full border-collapse min-w-[600px] border border-gray-300 rounded-lg overflow-hidden">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="w-14 p-1 text-[10px] font-semibold text-gray-500 border-b border-r border-gray-200">
                    HR
                  </th>
                  {(view === 'day' ? [selectedDate] : weekDays).map((day) => {
                    const isCurrentDay = isToday(day);
                    return (
                      <th
                        key={day.toISOString()}
                        className={"p-1 text-center border-b border-r border-gray-200 last:border-r-0" + (isCurrentDay ? ' bg-blue-50' : '')}
                      >
                        <div className={"text-[10px] font-medium" + (isCurrentDay ? ' text-blue-600' : ' text-gray-400')}>
                          {format(day, 'EEE')}
                        </div>
                        <div className={"text-sm font-bold" + (isCurrentDay ? ' text-blue-600' : ' text-gray-700')}>
                          {format(day, 'd')}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => {
                  const isCurrentHour = hour === getCurrentHour();
                  return (
                    <tr
                      key={hour}
                      className={isCurrentHour ? 'bg-yellow-50/50' : ''}
                    >
                      <td className="w-14 p-0.5 text-[10px] font-medium text-gray-400 text-center border-r border-b border-gray-100">
                        {formatHour(hour)}
                      </td>
                      {(view === 'day' ? [selectedDate] : weekDays).map((day) => {
                        const dateKey = formatDateKey(day);
                        const entry = entries[dateKey + '-' + hour];
                        const category = entry?.category || categories.find(c => c.id === entry?.category_id);
                        const isSelected = selectedCell?.date === dateKey && selectedCell?.hour === hour;

                        return (
                          <td
                            key={dateKey + '-' + hour}
                            onClick={() => handleCellClick(dateKey, hour)}
                            className={'p-0 h-7 border-r border-b border-gray-100 last:border-r-0 cursor-pointer transition-all' + (isSelected ? ' ring-2 ring-blue-500 ring-inset' : '') + (!category ? ' hover:bg-gray-50' : '')}
                            style={category ? { backgroundColor: category.color } : undefined}
                          >
                            {category && (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white/90">
                                  {category.shorthand}
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Stats Breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 mt-8 flex-shrink-0 border border-gray-300">
        <div className="text-center mb-3">
          <span className="text-lg font-semibold text-gray-900">
            Breakdown
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(stats)
            .filter(([name, hours]) => hours > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([name, hours]) => {
              const cat = categories.find(c => c.name === name);
              return (
                <div
                  key={name}
                  className="flex flex-col items-center text-center p-3 rounded-lg bg-white border border-gray-200 shadow-sm"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base mb-2"
                    style={{ backgroundColor: cat?.color || '#6b7280' }}
                  >
                    {cat?.shorthand}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1 truncate w-full">
                    {cat?.name}
                  </div>
                  <div className="text-lg font-bold text-gray-700">
                    {hours}h
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      </div>
      </div>

      {/* Category Picker Modal */}
      {showCategoryPicker && selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            ref={pickerRef}
            className="bg-white rounded-xl shadow-2xl p-4 max-w-sm w-full mx-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">Quick Log</div>
                <div className="text-sm text-gray-500">
                  Click to auto-log to next available hour
                </div>
              </div>
              <button
                onClick={() => { setShowCategoryPicker(false); setSelectedCell(null); }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              Click category to auto-log chronologically
            </p>

            <div className="grid grid-cols-3 gap-2">
              {categories
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={"flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"}
                >
                  <div
                    className={"w-12 h-12 rounded-md flex items-center justify-center text-white font-bold text-base"}
                    style={{ backgroundColor: category.color }}
                  >
                    {category.shorthand}
                  </div>
                  <span className={"text-xs text-gray-600 text-center leading-tight truncate w-full"}>
                    {category.name}
                  </span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-4 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">Export Data</div>
                <div className="text-sm text-gray-500">
                  Download your time tracking data as CSV
                </div>
              </div>
              <button
                onClick={() => setShowExportOptions(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Year
                </label>
                <select
                  value={exportYear}
                  onChange={(e) => setExportYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={() => {
                  exportData();
                  setShowExportOptions(false);
                }}
                className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>

              <p className="text-xs text-gray-500 text-center">
                CSV format perfect for Excel, Google Sheets, or data analysis tools
              </p>
            </div>
          </div>
        </div>
      )}




      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

// Month Overview Component
function MonthView({
  monthDays,
  entries,
  categories,
  selectedDate,
}: {
  monthDays: Date[];
  entries: Record<string, any>;
  categories: Category[];
  selectedDate: Date;
}) {
  // Get week rows
  const firstDayOfMonth = startOfMonth(selectedDate);
  const startPadding = firstDayOfMonth.getDay();
  const paddedDays = Array(startPadding).fill(null).concat(monthDays);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  // Get daily totals
  const getDayStats = (day: Date) => {
    const dateKey = formatDateKey(day);
    let total = 0;
    const dayCats: Record<string, number> = {};
    for (let h = 0; h < 24; h++) {
      const entry = entries[dateKey + '-' + h];
      if (entry?.category) {
        total++;
        dayCats[entry.category.id] = (dayCats[entry.category.id] || 0) + 1;
      }
    }
    return { total, categories: dayCats };
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="aspect-square" />;

              const dayStats = getDayStats(day);
              const isCurrentDay = isToday(day);
              const topCat = Object.entries(dayStats.categories).sort((a, b) => b[1] - a[1])[0];
              const topCategory = topCat ? categories.find(c => c.id === topCat[0]) : null;

              return (
                <div
                  key={di}
                  className={'aspect-square rounded-lg border p-1 flex flex-col ' + (isCurrentDay ? 'border-blue-500 border-2' : 'border-gray-200') + (dayStats.total > 0 ? ' bg-gray-50' : '')}
                >
                  <div className={"text-xs font-medium " + (isCurrentDay ? 'text-blue-600' : 'text-gray-500')}>
                    {format(day, 'd')}
                  </div>
                  {dayStats.total > 0 && (
                    <div className="flex-1 flex flex-col justify-end">
                      {/* Mini bar showing category breakdown */}
                      <div className="h-2 rounded-full overflow-hidden flex">
                        {Object.entries(dayStats.categories)
                          .sort((a, b) => b[1] - a[1])
                          .map(([catId, count]) => {
                            const cat = categories.find(c => c.id === catId);
                            return (
                              <div
                                key={catId}
                                style={{
                                  backgroundColor: cat?.color,
                                  width: (count / 24) * 100 + '%',
                                }}
                              />
                            );
                          })}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 text-center">
                        {dayStats.total}h
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
