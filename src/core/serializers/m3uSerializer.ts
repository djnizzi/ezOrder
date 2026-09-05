import { LineEnding, M3uItemData, M3uMetadata, OrderedItem } from '../../types';

export interface M3uSerializerOptions {
  lineEnding?: LineEnding;
}

export function serializeM3u(
  items: OrderedItem<M3uItemData>[],
  meta?: M3uMetadata,
  defaultLineEnding: LineEnding = '\n',
  options: M3uSerializerOptions = {}
): string {
  const newline = options.lineEnding || defaultLineEnding;
  const lines: string[] = [];

  // Write header
  const header = meta?.headerTag || '#EXTM3U';
  lines.push(header);

  // Write global directives if any
  if (meta?.globalDirectives) {
    for (const gd of meta.globalDirectives) {
      lines.push(gd);
    }
  }

  // Write each item and its directives
  for (const item of items) {
    if (item.data.rawDirectives && item.data.rawDirectives.length > 0) {
      for (const dir of item.data.rawDirectives) {
        lines.push(dir);
      }
    } else {
      // Synthesize basic EXTINF if none was present
      const dur = item.data.duration ?? -1;
      lines.push(`#EXTINF:${dur},${item.data.title}`);
    }
    lines.push(item.data.uri);
  }

  return lines.join(newline);
}
