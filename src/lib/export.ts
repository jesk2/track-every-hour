import * as XLSX from 'xlsx';
import { getSupabaseClient } from './supabase/client';

export interface ExportData {
  id: string;
  date: string;
  hour: number;
  category_name: string;
  category_color: string;
  is_productive: boolean;
  shorthand: string;
  notes: string | null;
  custom_label: string | null;
  created_at: string;
  updated_at: string;
}

export async function exportUserData(format: 'csv' | 'json' | 'xlsx', userId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    // Fetch all time entries with category information
    const { data: entries, error } = await supabase
      .from('time_entries')
      .select(`
        id,
        date,
        hour,
        notes,
        custom_label,
        created_at,
        updated_at,
        categories (
          name,
          color,
          is_productive,
          shorthand
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('hour', { ascending: true });

    if (error) throw error;

    // Transform data for export
    const exportData: ExportData[] = (entries || []).map((entry: any) => ({
      id: entry.id,
      date: entry.date,
      hour: entry.hour,
      category_name: entry.categories?.name || 'No Category',
      category_color: entry.categories?.color || '#9CA3AF',
      is_productive: entry.categories?.is_productive ?? true,
      shorthand: entry.categories?.shorthand || '',
      notes: entry.notes,
      custom_label: entry.custom_label,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    }));

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `everyhour-data-${timestamp}`;

    switch (format) {
      case 'csv':
        exportToCSV(exportData, filename);
        break;
      case 'json':
        exportToJSON(exportData, filename);
        break;
      case 'xlsx':
        exportToExcel(exportData, filename);
        break;
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data. Please try again.');
  }
}

function exportToCSV(data: ExportData[], filename: string): void {
  const headers = [
    'Date',
    'Hour',
    'Category',
    'Category Color',
    'Is Productive',
    'Shorthand',
    'Notes',
    'Custom Label',
    'Created At',
    'Updated At'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.date,
      row.hour.toString(),
      `"${row.category_name}"`,
      row.category_color,
      row.is_productive.toString(),
      `"${row.shorthand}"`,
      `"${row.notes || ''}"`,
      `"${row.custom_label || ''}"`,
      row.created_at,
      row.updated_at
    ].join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

function exportToJSON(data: ExportData[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

function exportToExcel(data: ExportData[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data.map(row => ({
    'Date': row.date,
    'Hour': row.hour,
    'Category': row.category_name,
    'Category Color': row.category_color,
    'Is Productive': row.is_productive,
    'Shorthand': row.shorthand,
    'Notes': row.notes || '',
    'Custom Label': row.custom_label || '',
    'Created At': row.created_at,
    'Updated At': row.updated_at,
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Time Entries');

  // Generate and download the file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
