import React from 'react';
import {
  ArrowUpDown,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  Moon,
  PlusCircle,
  Sun,
  Trash2,
} from 'lucide-react';
import { ParsedDocument, SupportedFormat } from '../../types';

interface NavbarProps {
  document: ParsedDocument | null;
  selectedCount: number;
  movedCount: number;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
  onOpenExport: () => void;
  onNewList: () => void;
  onClear: () => void;
  onAddItem: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const FORMAT_COLORS: Record<SupportedFormat, { bg: string; text: string; border: string }> = {
  csv: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', text: 'CSV', border: 'border-emerald-500' },
  txt: { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', text: 'TXT', border: 'border-blue-500' },
  m3u: { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30', text: 'M3U', border: 'border-purple-500' },
  xml: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', text: 'XML', border: 'border-amber-500' },
};

export const Navbar: React.FC<NavbarProps> = ({
  document,
  selectedCount,
  movedCount,
  isPreviewOpen,
  onTogglePreview,
  onOpenExport,
  onNewList,
  onClear,
  onAddItem,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Document info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                ezOrder
              </span>
              {document && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                    FORMAT_COLORS[document.format]?.bg || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {document.format}
                </span>
              )}
            </div>
            {document ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs sm:max-w-md">
                {document.fileName} • {document.items.length} items
                {movedCount > 0 && (
                  <span className="ml-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    ({movedCount} reordered)
                  </span>
                )}
                {selectedCount > 0 && (
                  <span className="ml-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                    ({selectedCount} selected)
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">Drag & Drop List Reorder</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {document && (
            <>
              <button
                type="button"
                onClick={onAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="Add new item to list"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Add Item</span>
              </button>

              <button
                type="button"
                onClick={onTogglePreview}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                  isPreviewOpen
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
                    : 'text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                title="Toggle Live Output Preview"
              >
                {isPreviewOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Preview</span>
              </button>

              <button
                type="button"
                onClick={onOpenExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition"
                title="Export or Download reordered file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onNewList}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Open new file or sample"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Open</span>
          </button>

          {document && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Close current file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
