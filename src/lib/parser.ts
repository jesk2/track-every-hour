import { Category, ParseResult } from '@/types';

/**
 * Parse flexible input to match a category
 * Supports: number (ID), letter (shorthand), word (name), or custom text
 */
export function parseInput(input: string, categories: Category[]): ParseResult {
  const trimmed = input.trim().toLowerCase();

  // Empty input
  if (!trimmed) {
    return { type: 'custom', confidence: 0 };
  }

  // 1. Check for numeric ID
  if (/^\d+$/.test(trimmed)) {
    const numId = parseInt(trimmed, 10);
    const category = categories.find(c => c.numeric_id === numId);
    if (category) {
      return { type: 'category', categoryId: category.id, confidence: 1.0 };
    }
  }

  // 2. Check for single letter shorthand
  if (/^[a-z]$/i.test(trimmed)) {
    const category = categories.find(
      c => c.shorthand?.toLowerCase() === trimmed
    );
    if (category) {
      return { type: 'category', categoryId: category.id, confidence: 1.0 };
    }
  }

  // 3. Check for exact word match
  const exactMatch = categories.find(
    c => c.name.toLowerCase() === trimmed
  );
  if (exactMatch) {
    return { type: 'category', categoryId: exactMatch.id, confidence: 1.0 };
  }

  // 4. Check for partial word match (starts with)
  const partialMatch = categories.find(
    c => c.name.toLowerCase().startsWith(trimmed)
  );
  if (partialMatch && trimmed.length >= 2) {
    return { type: 'category', categoryId: partialMatch.id, confidence: 0.8 };
  }

  // 5. No match - treat as custom text
  return { type: 'custom', customText: input.trim(), confidence: 0 };
}

/**
 * Get category suggestions based on partial input
 */
export function getSuggestions(input: string, categories: Category[]): Category[] {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return [];

  return categories.filter(c =>
    c.name.toLowerCase().includes(trimmed) ||
    c.shorthand?.toLowerCase() === trimmed ||
    c.numeric_id?.toString() === trimmed
  ).slice(0, 5);
}
