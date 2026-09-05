import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  GripVertical,
  Trash2,
} from 'lucide-react';
import { OrderedItem } from '../../types';

interface SortableItemProps {
  item: OrderedItem;
  displayIndex: number;
  isSelected: boolean;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (item: OrderedItem) => void;
  onDelete: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  item,
  displayIndex,
  isSelected,
  onToggleSelect,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  isFirst,
  isLast,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const delta = displayIndex - item.originalIndex;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl border transition-all select-none ${
        isDragging
          ? 'opacity-40 bg-indigo-50/50 dark:bg-indigo-950/40 border-dashed border-indigo-400 dark:border-indigo-600'
          : isSelected
          ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-sm'
          : 'bg-white dark:bg-gray-800/90 border-gray-200/90 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xs'
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Select Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => {}}
        onClick={(e) => onToggleSelect(item.id, e)}
        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
      />

      {/* Position Badge & Movement Delta */}
      <div className="flex items-center gap-1 shrink-0 w-16 sm:w-20">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono">
          #{displayIndex + 1}
        </span>
        {delta !== 0 ? (
          <span
            className={`text-[10px] font-semibold px-1 rounded font-mono ${
              delta < 0
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
            title={`Moved ${Math.abs(delta)} position(s) ${delta < 0 ? 'up' : 'down'} from original #${item.originalIndex + 1}`}
          >
            {delta < 0 ? `▲${Math.abs(delta)}` : `▼${delta}`}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-mono">orig</span>
        )}
      </div>

      {/* Item Content (Label & Sublabel) */}
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={(e) => onToggleSelect(item.id, e)}
      >
        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate leading-snug">
          {item.label}
        </p>
        {item.sublabel && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 font-mono">
            {item.sublabel}
          </p>
        )}
      </div>

      {/* Per-item action buttons (hover or mobile) */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp(item.id);
          }}
          disabled={isFirst}
          className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20 transition"
          title="Move up one position"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown(item.id);
          }}
          disabled={isLast}
          className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20 transition"
          title="Move down one position"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="p-1 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title="Edit item details"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
          title="Delete item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
