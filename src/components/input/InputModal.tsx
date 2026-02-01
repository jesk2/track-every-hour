'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { parseInput, getSuggestions } from '@/lib/parser';
import { formatDateKey, formatHour } from '@/lib/date';

export function InputModal() {
  const {
    isInputModalOpen,
    selectedHour,
    closeInputModal,
    categories,
    selectedDate,
    setEntry,
    entries,
    removeEntry,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [notes, setNotes] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const dateKey = formatDateKey(selectedDate);
  const existingEntry = selectedHour !== null ? entries[`${dateKey}-${selectedHour}`] : undefined;

  // Focus input when modal opens
  useEffect(() => {
    if (isInputModalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isInputModalOpen]);

  // Pre-fill if editing existing entry
  useEffect(() => {
    if (existingEntry) {
      const category = categories.find(c => c.id === existingEntry.category_id);
      setInput(category?.name || existingEntry.custom_label || '');
      setNotes(existingEntry.notes || '');
    } else {
      setInput('');
      setNotes('');
    }
  }, [existingEntry, categories, isInputModalOpen]);

  if (!isInputModalOpen || selectedHour === null) return null;

  const parseResult = parseInput(input, categories);
  const suggestions = input.length > 0 ? getSuggestions(input, categories) : [];
  const selectedCategory = parseResult.type === 'category' && parseResult.categoryId
    ? categories.find(c => c.id === parseResult.categoryId)
    : undefined;

  const handleSave = () => {
    if (!input.trim() && !selectedCategory) {
      closeInputModal();
      return;
    }

    const entry = {
      id: existingEntry?.id || `local-${Date.now()}`,
      user_id: 'local',
      category_id: selectedCategory?.id || null,
      date: dateKey,
      hour: selectedHour,
      notes: notes || undefined,
      custom_label: parseResult.type === 'custom' ? parseResult.customText : undefined,
      created_at: existingEntry?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: selectedCategory,
    };

    setEntry(entry);
    closeInputModal();
  };

  const handleDelete = () => {
    removeEntry(dateKey, selectedHour);
    closeInputModal();
  };

  const handleCategorySelect = (category: typeof categories[0]) => {
    setInput(category.name);
    setEntry({
      id: existingEntry?.id || `local-${Date.now()}`,
      user_id: 'local',
      category_id: category.id,
      date: dateKey,
      hour: selectedHour,
      notes: notes || undefined,
      created_at: existingEntry?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: category,
    });
    closeInputModal();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      closeInputModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeInputModal}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white ">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 ">
          <h2 className="text-lg font-semibold">
            {formatHour(selectedHour)}
          </h2>
          <button
            onClick={closeInputModal}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type category, number, or letter..."
            className="w-full px-4 py-3 text-lg bg-gray-100 "
          />

          {/* Parse feedback */}
          {input && (
            <div className="mt-2 text-sm">
              {selectedCategory ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span style={{ color: selectedCategory.color }}>
                    {selectedCategory.name}
                  </span>
                </div>
              ) : parseResult.type === 'custom' ? (
                <span className="text-gray-500">
                  Custom: &quot;{parseResult.customText}&quot;
                </span>
              ) : null}
            </div>
          )}

          {/* Notes input */}
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes (optional)..."
            className="w-full mt-3 px-4 py-2 text-sm bg-gray-50 "
          />
        </div>

        {/* Category grid */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2 font-medium">Quick select:</p>
          <div className="grid grid-cols-5 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-lg
                  touch-manipulation active:scale-95 transition-all
                  ${selectedCategory?.id === category.id
                    ? 'ring-2 ring-offset-2'
                    : 'hover:bg-gray-50'}
                `}
                style={selectedCategory?.id === category.id ? {
                  boxShadow: `0 0 0 2px white, 0 0 0 4px ${category.color}`,
                } : undefined}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: category.color }}
                >
                  {category.shorthand || category.name[0]}
                </div>
                <span className="text-[10px] text-gray-600 ">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-gray-200 ">
          {existingEntry && (
            <button
              onClick={handleDelete}
              className="px-4 py-3 text-red-600 "
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
