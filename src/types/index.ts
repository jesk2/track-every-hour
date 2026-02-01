// Category type
export interface Category {
  id: string;
  user_id: string;
  name: string;
  shorthand: string | null;
  numeric_id: number | null;
  color: string;
  icon?: string;
  is_productive: boolean;
  is_quick_action: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Time entry type
export interface TimeEntry {
  id: string;
  user_id: string;
  category_id: string | null;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  notes?: string;
  custom_label?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// User profile
export interface Profile {
  id: string;
  email: string;
  display_name?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// Input parse result
export interface ParseResult {
  type: 'category' | 'custom';
  categoryId?: string;
  customText?: string;
  confidence: number;
}

// View type
export type ViewType = 'day' | 'week' | 'month';

// Categories
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  // Work categories (quick actions)
  { name: 'Research/Intern', shorthand: 'R', numeric_id: 1, color: '#3B82F6', is_productive: true, is_quick_action: true, sort_order: 5 },
  { name: 'Dev Work', shorthand: 'D', numeric_id: 2, color: '#8B5CF6', is_productive: true, is_quick_action: true, sort_order: 6 },
  { name: 'Work', shorthand: 'W', numeric_id: 3, color: '#2563EB', is_productive: true, is_quick_action: true, sort_order: 3 },
  { name: 'Classes', shorthand: 'L', numeric_id: 4, color: '#0EA5E9', is_productive: true, is_quick_action: true, sort_order: 2 },
  { name: 'MIT Work', shorthand: 'M', numeric_id: 5, color: '#A31F34', is_productive: true, is_quick_action: true, sort_order: 4 },

  // Other quick actions
  { name: 'Sleep', shorthand: 'S', numeric_id: 6, color: '#1E3A5F', is_productive: true, is_quick_action: true, sort_order: 1 },
  { name: 'Friends', shorthand: 'F', numeric_id: 7, color: '#EC4899', is_productive: true, is_quick_action: true, sort_order: 7 },

  // Rest of categories
  { name: 'Events/Networking', shorthand: 'N', numeric_id: 8, color: '#7C3AED', is_productive: true, is_quick_action: true, sort_order: 17 },
  { name: 'Commute', shorthand: 'T', numeric_id: 9, color: '#6B7280', is_productive: false, is_quick_action: true, sort_order: 14 },
  { name: 'Partner', shorthand: 'P', numeric_id: 10, color: '#F43F5E', is_productive: true, is_quick_action: true, sort_order: 15 },
  { name: 'Christian', shorthand: 'C', numeric_id: 11, color: '#F59E0B', is_productive: true, is_quick_action: true, sort_order: 10 },
  { name: 'Fam', shorthand: 'Y', numeric_id: 12, color: '#14B8A6', is_productive: true, is_quick_action: true, sort_order: 9 },
  { name: 'Medical', shorthand: 'H', numeric_id: 13, color: '#EF4444', is_productive: true, is_quick_action: true, sort_order: 18 },
  { name: 'Hobbies', shorthand: 'B', numeric_id: 14, color: '#10B981', is_productive: true, is_quick_action: true, sort_order: 11 },
  { name: 'Gym', shorthand: 'G', numeric_id: 15, color: '#84CC16', is_productive: true, is_quick_action: true, sort_order: 16 },
  { name: 'Scrolling', shorthand: 'Z', numeric_id: 16, color: '#DC2626', is_productive: false, is_quick_action: true, sort_order: 12 },
  { name: 'Admin/Life', shorthand: 'A', numeric_id: 17, color: '#9CA3AF', is_productive: false, is_quick_action: true, sort_order: 8 },
  { name: 'Food', shorthand: 'E', numeric_id: 18, color: '#F97316', is_productive: false, is_quick_action: true, sort_order: 13 },
];
