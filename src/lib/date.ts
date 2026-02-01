import { format, startOfDay, addDays, subDays, isSameDay, parseISO } from 'date-fns';

/**
 * Format date as YYYY-MM-DD (for database)
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format date for display (e.g., "Friday, Jan 31")
 */
export function formatDateDisplay(date: Date): string {
  return format(date, 'EEEE, MMM d');
}

/**
 * Format hour for display (e.g., "9 AM", "12 PM")
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Get today's date at midnight
 */
export function getToday(): Date {
  return startOfDay(new Date());
}

/**
 * Navigate to next day
 */
export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

/**
 * Navigate to previous day
 */
export function getPrevDay(date: Date): Date {
  return subDays(date, 1);
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Get current hour (0-23)
 */
export function getCurrentHour(): number {
  return new Date().getHours();
}

/**
 * Parse date string to Date object
 */
export function parseDateKey(dateStr: string): Date {
  return parseISO(dateStr);
}
