import { describe, expect, it } from 'vitest';
import {
  moveItemsRelative,
  moveItemsToBottom,
  moveItemsToTop,
  reorderMultiple,
  reorderSingle,
  reverseItems,
  sortAlphabetical,
  sortByOriginal,
} from '../reorderUtils';
import { OrderedItem } from '../../types';

function makeMockItems(labels: string[]): OrderedItem[] {
  return labels.map((label, idx) => ({
    id: `id_${label}`,
    originalIndex: idx,
    label,
    data: {} as any,
  }));
}

describe('reorderUtils', () => {
  it('reorders single item correctly', () => {
    const items = makeMockItems(['A', 'B', 'C', 'D']);
    const result = reorderSingle(items, 0, 2);
    expect(result.map((i) => i.label)).toEqual(['B', 'C', 'A', 'D']);
  });

  it('reorders multiple selected items together to a target index', () => {
    const items = makeMockItems(['A', 'B', 'C', 'D', 'E']);
    const selectedIds = new Set(['id_B', 'id_D']);
    const result = reorderMultiple(items, selectedIds, 0);
    // B and D moved to start
    expect(result.map((i) => i.label)).toEqual(['B', 'D', 'A', 'C', 'E']);
  });

  it('moves items to top and bottom', () => {
    const items = makeMockItems(['A', 'B', 'C', 'D']);
    const topResult = moveItemsToTop(items, new Set(['id_C']));
    expect(topResult.map((i) => i.label)).toEqual(['C', 'A', 'B', 'D']);

    const bottomResult = moveItemsToBottom(items, new Set(['id_B']));
    expect(bottomResult.map((i) => i.label)).toEqual(['A', 'C', 'D', 'B']);
  });

  it('moves items relatively up and down', () => {
    const items = makeMockItems(['A', 'B', 'C', 'D']);
    const movedUp = moveItemsRelative(items, new Set(['id_C']), -1);
    expect(movedUp.map((i) => i.label)).toEqual(['A', 'C', 'B', 'D']);

    const movedDown = moveItemsRelative(movedUp, new Set(['id_C']), 1);
    expect(movedDown.map((i) => i.label)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('sorts alphabetically and by original index', () => {
    const items = makeMockItems(['Banana', 'Apple', 'Cherry']);
    const asc = sortAlphabetical(items, 'asc');
    expect(asc.map((i) => i.label)).toEqual(['Apple', 'Banana', 'Cherry']);

    const desc = sortAlphabetical(items, 'desc');
    expect(desc.map((i) => i.label)).toEqual(['Cherry', 'Banana', 'Apple']);

    const reversed = reverseItems(asc);
    expect(reversed.map((i) => i.label)).toEqual(['Cherry', 'Banana', 'Apple']);

    const original = sortByOriginal(reversed, 'asc');
    expect(original.map((i) => i.label)).toEqual(['Banana', 'Apple', 'Cherry']);
  });
});
