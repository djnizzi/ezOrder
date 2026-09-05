import { LineEnding, OrderedItem, ParsedDocument, SupportedFormat } from '../types';
import { parseCsv } from './parsers/csvParser';
import { parseM3u } from './parsers/m3uParser';
import { parseTxt } from './parsers/txtParser';
import { parseXml } from './parsers/xmlParser';
import { serializeCsv } from './serializers/csvSerializer';
import { serializeM3u } from './serializers/m3uSerializer';
import { serializeTxt } from './serializers/txtSerializer';
import { serializeXml } from './serializers/xmlSerializer';

export function detectFormatFromFileName(fileName: string): SupportedFormat {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'csv':
    case 'tsv':
      return 'csv';
    case 'm3u':
    case 'm3u8':
      return 'm3u';
    case 'xml':
      return 'xml';
    case 'txt':
    default:
      return 'txt';
  }
}

export function detectFormatFromContent(content: string): SupportedFormat {
  const trimmed = content.trim();
  if (trimmed.startsWith('#EXTM3U') || /#EXTINF:/.test(trimmed)) {
    return 'm3u';
  }
  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
    return 'xml';
  }
  // Check if likely CSV: multiple lines with comma, tab, or semicolon
  const lines = trimmed.split(/\r?\n/).slice(0, 5);
  if (lines.length > 1) {
    const commaCount = (lines[0].match(/,/g) || []).length;
    const semiCount = (lines[0].match(/;/g) || []).length;
    const tabCount = (lines[0].match(/\t/g) || []).length;
    if (commaCount >= 1 || semiCount >= 1 || tabCount >= 1) {
      return 'csv';
    }
  }
  return 'txt';
}

export function parseDocument(content: string, fileName: string, forcedFormat?: SupportedFormat): ParsedDocument {
  const format = forcedFormat || (fileName ? detectFormatFromFileName(fileName) : detectFormatFromContent(content));

  switch (format) {
    case 'csv':
      return parseCsv(content, fileName);
    case 'm3u':
      return parseM3u(content, fileName);
    case 'xml':
      return parseXml(content, fileName);
    case 'txt':
    default:
      return parseTxt(content, fileName);
  }
}

export interface SerializeOptions {
  lineEnding?: LineEnding;
  csvDelimiter?: string;
  csvIncludeHeaders?: boolean;
}

export function serializeDocument(doc: ParsedDocument, items: OrderedItem[], options: SerializeOptions = {}): string {
  switch (doc.format) {
    case 'csv':
      return serializeCsv(items as any, doc.csvMeta, doc.lineEnding, {
        delimiter: options.csvDelimiter,
        includeHeaders: options.csvIncludeHeaders,
        lineEnding: options.lineEnding,
      });
    case 'm3u':
      return serializeM3u(items as any, doc.m3uMeta, doc.lineEnding, {
        lineEnding: options.lineEnding,
      });
    case 'xml':
      return serializeXml(items as any, doc.xmlMeta, doc.originalContent, doc.lineEnding, {
        lineEnding: options.lineEnding,
      });
    case 'txt':
    default:
      return serializeTxt(items as any, doc.lineEnding, {
        lineEnding: options.lineEnding,
      });
  }
}

export function getFileMimeType(format: SupportedFormat): string {
  switch (format) {
    case 'csv':
      return 'text/csv;charset=utf-8;';
    case 'm3u':
      return 'audio/x-mpegurl;charset=utf-8;';
    case 'xml':
      return 'application/xml;charset=utf-8;';
    case 'txt':
    default:
      return 'text/plain;charset=utf-8;';
  }
}

export const SAMPLE_FILES = {
  csv: {
    name: 'top_priority_tasks.csv',
    content: `Priority,Task Name,Assigned To,Status,Est Hours
High,Refactor payment gateway,Alice,In Progress,8
Critical,Fix database deadlock on checkout,Bob,Open,4
Medium,Design dark mode settings screen,Carol,Review,6
Low,Update dependency audit notes,Dave,Completed,2
High,Implement CSV drag and drop reordering,Eve,Open,5
Critical,Release ezOrder v1.0,Alice,Open,3`,
  },
  txt: {
    name: 'grocery_shopping_list.txt',
    content: `Organic Whole Milk
Fresh Sourdough Bread
Arabica Coffee Beans
Extra Virgin Olive Oil
Baby Spinach
Greek Yogurt (Plain)
Free-range Eggs (Dozen)
Honeycrisp Apples
Dark Chocolate 85%
Avocados`,
  },
  m3u: {
    name: 'synthwave_workout_mix.m3u',
    content: `#EXTM3U
#EXTINF:254,The Midnight - Sunset
music/the_midnight_sunset.mp3
#EXTINF:312,Gunship - Tech Noir
music/gunship_tech_noir.mp3
#EXTINF:225,Kavinsky - Nightcall
music/kavinsky_nightcall.mp3
#EXTINF:280,FM-84 - Running in the Night
music/fm84_running_in_the_night.mp3
#EXTINF:198,Timecop1983 - On the Run
music/timecop1983_on_the_run.mp3`,
  },
  xml: {
    name: 'podcast_playlist.xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<playlist title="Tech Podcast Queue">
  <channel name="Developer Daily">
    <episode id="ep101" duration="42:15">
      <title>Building Modern Offline-First Web Apps</title>
      <speaker>Sarah Lin</speaker>
    </episode>
    <episode id="ep102" duration="38:50">
      <title>Accessible Drag-and-Drop with dnd-kit</title>
      <speaker>Mark Davis</speaker>
    </episode>
    <episode id="ep103" duration="55:10">
      <title>React 19 Server Components vs Client State</title>
      <speaker>Alex Rivera</speaker>
    </episode>
    <episode id="ep104" duration="29:45">
      <title>The Art of UI Micro-Interactions</title>
      <speaker>Emily Thorne</speaker>
    </episode>
  </channel>
</playlist>`,
  },
};
