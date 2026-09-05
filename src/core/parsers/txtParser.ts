import { OrderedItem, ParsedDocument, TxtItemData } from '../../types';
import { detectLineEnding, generateId } from '../utils';

export interface TxtParserOptions {
  ignoreEmptyLines?: boolean;
  trimLines?: boolean;
}

export function parseTxt(content: string, fileName = 'list.txt', options: TxtParserOptions = {}): ParsedDocument {
  const lineEnding = detectLineEnding(content);
  // Normalize lines split
  const rawLines = content.split(/\r?\n/);
  
  const items: OrderedItem<TxtItemData>[] = [];
  let index = 0;

  for (const rawLine of rawLines) {
    const text = options.trimLines ? rawLine.trim() : rawLine;
    if (options.ignoreEmptyLines && text.length === 0) {
      continue;
    }

    items.push({
      id: generateId(),
      originalIndex: index,
      label: text || '(empty line)',
      data: {
        text: rawLine,
      },
    });
    index++;
  }

  return {
    id: generateId(),
    fileName,
    format: 'txt',
    items,
    originalContent: content,
    lineEnding,
  };
}
