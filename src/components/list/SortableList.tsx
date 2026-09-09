import React, { useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical, Layers, PlusCircle } from 'lucide-react';
import { OrderedItem } from '../../types';
import { SortableItem } from './SortableItem';

interface SortableListProps {
  items: OrderedItem[];
  filteredItems: OrderedItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onReorder: (activeId: string, overId: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEditItem: (item: OrderedItem) => void;
  onDeleteItem: (id: string) => void;
  onAddRow?: () => void;
}

export const SortableList: React.FC<SortableListProps> = ({
  items,
  filteredItems,
  selectedIds,
  onToggleSelect,
  onReorder,
  onMoveUp,
  onMoveDown,
  onEditItem,
  onDeleteItem,
  onAddRow,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // 6px threshold prevents accidental drag when clicking checkboxes
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;
  const isMultiDrag = activeId && selectedIds.has(activeId) && selectedIds.size > 1;

  if (filteredItems.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white/40 dark:bg-gray-800/40">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          No items match your filter.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={filteredItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {filteredItems.map((item, index) => {
            const isSelected = selectedIds.has(item.id);
            const globalIndex = items.findIndex((i) => i.id === item.id);
            return (
              <SortableItem
                key={item.id}
                item={item}
                displayIndex={globalIndex >= 0 ? globalIndex : index}
                isSelected={isSelected}
                onToggleSelect={onToggleSelect}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                isFirst={globalIndex === 0}
                isLast={globalIndex === items.length - 1}
              />
            );
          })}

          {onAddRow && (
            <button
              type="button"
              onClick={onAddRow}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/40 dark:bg-gray-800/30 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-xs font-semibold transition group cursor-pointer mt-3"
            >
              <PlusCircle className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
              <span>Add New Row to List</span>
            </button>
          )}
        </div>
      </SortableContext>

      {/* Floating Drag Overlay */}
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeItem ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-indigo-400 bg-white dark:bg-gray-800 shadow-xl opacity-95 scale-[1.02] ring-2 ring-indigo-500/20">
            <GripVertical className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              #{items.findIndex((i) => i.id === activeItem.id) + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                {activeItem.label}
              </p>
              {activeItem.sublabel && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-mono">
                  {activeItem.sublabel}
                </p>
              )}
            </div>
            {isMultiDrag && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                <Layers className="w-3 h-3" />
                {selectedIds.size} items
              </span>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
