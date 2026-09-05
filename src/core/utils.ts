import { LineEnding } from '../types';

export function detectLineEnding(content: string): LineEnding {
  const crlfCount = (content.match(/\r\n/g) || []).length;
  const lfCount = (content.match(/[^\r]\n/g) || []).length;
  return crlfCount >= lfCount ? '\r\n' : '\n';
}

export function generateId(): string {
  return 'item_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
