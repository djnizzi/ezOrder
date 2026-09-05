import { OrderedItem, SortDirection } from '../types';
import { naturalCompare } from './utils';

export function reorderSingle<T>(list: OrderedItem<T>[], startIndex: number, endIndex: number): OrderedItem<T>[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function reorderMultiple<T>(
  list: OrderedItem<T>[],
  selectedIds: Set<string>,
  targetIndex: number
): OrderedItem<T>[] {
  const selectedItems = list.filter((item) => selectedIds.has(item.id));
  const remainingItems = list.filter((item) => !selectedIds.has(item.id));

  // Determine clamped insert index
  const safeTargetIndex = Math.max(0, Math.min(targetIndex, remainingItems.length));
  const result = [...remainingItems];
  result.splice(safeTargetIndex, 0, ...selectedItems);
  return result;
}

export function sortAlphabetical<T>(list: OrderedItem<T>[], direction: SortDirection = 'asc'): OrderedItem<T>[] {
  return [...list].sort((a, b) => {
    const cmp = naturalCompare(a.label, b.label);
    return direction === 'asc' ? cmp : -cmp;
  });
}

export function sortByOriginal<T>(list: OrderedItem<T>[], direction: SortDirection = 'asc'): OrderedItem<T>[] {
  return [...list].sort((a, b) => {
    const cmp = a.originalIndex - b.originalIndex;
    return direction === 'asc' ? cmp : -cmp;
  });
}

export function reverseItems<T>(list: OrderedItem<T>[]): OrderedItem<T>[] {
  return [...list].reverse();
}

export function shuffleItems<T>(list: OrderedItem<T>[]): OrderedItem<T>[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function moveItemsToTop<T>(list: OrderedItem<T>[], selectedIds: Set<string>): OrderedItem<T>[] {
  const selected = list.filter((item) => selectedIds.has(item.id));
  const unselected = list.filter((item) => !selectedIds.has(item.id));
  return [...selected, ...unselected];
}

export function moveItemsToBottom<T>(list: OrderedItem<T>[], selectedIds: Set<string>): OrderedItem<T>[] {
  const selected = list.filter((item) => selectedIds.has(item.id));
  const unselected = list.filter((item) => !selectedIds.has(item.id));
  return [...unselected, ...selected];
}

export function moveItemsRelative<T>(
  list: OrderedItem<T>[],
  selectedIds: Set<string>,
  direction: -1 | 1
): OrderedItem<T>[] {
  const result = [...list];
  if (direction === -1) {
    // Move up: iterate from left to right
    for (let i = 1; i < result.length; i++) {
      if (selectedIds.has(result[i].id) && !selectedIds.has(result[i - 1].id)) {
        [result[i], result[i - 1]] = [result[i - 1], result[i]];
      }
    }
  } else {
    // Move down: iterate from right to left
    for (let i = result.length - 2; i >= 0; i--) {
      if (selectedIds.has(result[i].id) && !selectedIds.has(result[i + 1].id)) {
        [result[i], result[i + 1]] = [result[i + 1], result[i]];
      }
    }
  }
  return result;
}
