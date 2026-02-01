'use client';

import { useState } from 'react';
import { X, Download, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
import { exportUserData } from '@/lib/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: 'csv' | 'json' | 'xlsx') => {
    setExporting(format);
    setError(null);

    try {
      await exportUserData(format);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      format: 'csv' as const,
      name: 'CSV',
      description: 'Excel & Google Sheets compatible',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      format: 'json' as const,
      name: 'JSON',
      description: 'Developer-friendly format',
      icon: FileJson,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      format: 'xlsx' as const,
      name: 'Excel',
      description: 'Native Excel spreadsheet',
      icon: FileSpreadsheet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Export Your Data</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Download all your time tracking data for analysis and backup. Choose your preferred format below.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isExporting = exporting === option.format;

              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={!!exporting}
                  className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-left
                    ${option.borderColor} ${option.bgColor} hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${option.color}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {isExporting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-600"></div>
                    ) : (
                      <Download className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>What gets exported:</strong> All time entries with categories, dates, hours, notes, and metadata. Perfect for data analysis in Excel, Google Sheets, or programming tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}