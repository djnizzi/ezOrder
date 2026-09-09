import React from 'react';
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  CheckSquare,
  ChevronsUpDown,
  RotateCcw,
  Search,
  Shuffle,
  Square,
  Trash2,
  Undo2,
  Redo2,
  X,
  SlidersHorizontal,
  PlusCircle,
} from 'lucide-react';
import { ParsedDocument } from '../../types';

interface ToolbarProps {
  document: ParsedDocument;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCount: number;
  totalCount: number;
  onAddRow: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDeleteSelected: () => void;
  onSortAlphaAsc: () => void;
  onSortAlphaDesc: () => void;
  onReverse: () => void;
  onShuffle: () => void;
  onResetOriginal: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCsvLabelColumnChange?: (col: string) => void;
  onXmlTagChange?: (tag: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  document,
  searchTerm,
  onSearchChange,
  selectedCount,
  totalCount,
  onAddRow,
  onSelectAll,
  onDeselectAll,
  onMoveToTop,
  onMoveToBottom,
  onMoveUp,
  onMoveDown,
  onDeleteSelected,
  onSortAlphaAsc,
  onSortAlphaDesc,
  onReverse,
  onShuffle,
  onResetOriginal,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCsvLabelColumnChange,
  onXmlTagChange,
}) => {
  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;

  return (
    <div className="bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-sm p-3 mb-4 flex flex-col gap-3 transition-colors">
      {/* Top Row: Search, Add Row, Undo/Redo, Quick Sorts */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Filter ${totalCount} items...`}
            className="w-full text-xs pl-9 pr-8 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Add Row Button */}
        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow active:scale-98 transition shrink-0"
          title="Add a new row to list"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Row</span>
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sort Actions */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={onSortAlphaAsc}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
            title="Sort Alphabetically A to Z"
          >
            <span>A→Z</span>
          </button>
          <button
            type="button"
            onClick={onSortAlphaDesc}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
            title="Sort Alphabetically Z to A"
          >
            <span>Z→A</span>
          </button>
          <button
            type="button"
            onClick={onReverse}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
            title="Reverse Current Order"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reverse</span>
          </button>
          <button
            type="button"
            onClick={onShuffle}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition"
            title="Randomize / Shuffle List"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>
          <button
            type="button"
            onClick={onResetOriginal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Reset to Original Order"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Original</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Selection controls, Batch move actions & Format config */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 text-xs">
        {/* Selection toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium py-1 px-1.5 rounded"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
            <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
          </button>

          {selectedCount > 0 && (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full text-[11px]">
              {selectedCount} of {totalCount} selected
            </span>
          )}
        </div>

        {/* Batch Reordering Actions (active if 1+ selected) */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900/60 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onMoveToTop}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
              title="Move selected to Top"
            >
              <ArrowUpToLine className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
              title="Move selected Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
              title="Move selected Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveToBottom}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
              title="Move selected to Bottom"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-gray-300 dark:bg-gray-700 mx-0.5" />
            <button
              type="button"
              onClick={onDeleteSelected}
              className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-500 transition"
              title="Delete selected items"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Format Specific Configuration Options */}
        <div className="flex items-center gap-2 ml-auto">
          {document.format === 'csv' && document.csvMeta?.headers && document.csvMeta.headers.length > 1 && onCsvLabelColumnChange && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Label Column:</span>
              <select
                value={document.csvMeta.selectedLabelColumn || document.csvMeta.headers[0]}
                onChange={(e) => onCsvLabelColumnChange(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-0.5 text-gray-800 dark:text-gray-200"
              >
                {document.csvMeta.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          )}

          {document.format === 'xml' && document.xmlMeta?.availableItemTags && document.xmlMeta.availableItemTags.length > 1 && onXmlTagChange && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <SlidersHorizontal className="w-3 h-3" />
              <span>XML Item Tag:</span>
              <select
                value={document.xmlMeta.itemTag}
                onChange={(e) => onXmlTagChange(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-0.5 text-gray-800 dark:text-gray-200"
              >
                {document.xmlMeta.availableItemTags.map((t) => (
                  <option key={t.tag} value={t.tag}>
                    &lt;{t.tag}&gt; ({t.count})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
