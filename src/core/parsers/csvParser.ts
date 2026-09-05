import Papa from 'papaparse';
import { CsvItemData, CsvMetadata, OrderedItem, ParsedDocument } from '../../types';
import { detectLineEnding, generateId } from '../utils';

export interface CsvParserOptions {
  delimiter?: string;
  hasHeader?: boolean;
}

export function parseCsv(content: string, fileName = 'data.csv', options: CsvParserOptions = {}): ParsedDocument {
  const lineEnding = detectLineEnding(content);

  // Parse raw matrix first to inspect headers
  const parsed = Papa.parse<string[]>(content, {
    delimiter: options.delimiter || '', // empty string tells PapaParse to auto-detect delimiter
    skipEmptyLines: 'greedy',
  });

  const delimiter = parsed.meta.delimiter || ',';
  const rows = (parsed.data || []) as string[][];

  if (rows.length === 0) {
    return {
      id: generateId(),
      fileName,
      format: 'csv',
      items: [],
      originalContent: content,
      lineEnding,
      csvMeta: {
        headers: [],
        delimiter,
        hasHeaderRow: false,
      },
    };
  }

  // Determine if first row is header
  const hasHeaderRow = options.hasHeader !== undefined ? options.hasHeader : true;

  let headers: string[] = [];
  let dataRows: string[][] = [];

  if (hasHeaderRow && rows.length > 1) {
    headers = rows[0].map((h, i) => (h && h.trim() ? h.trim() : `Column ${i + 1}`));
    dataRows = rows.slice(1);
  } else if (hasHeaderRow && rows.length === 1) {
    // If only 1 row, treat as data unless user explicitly specified hasHeader
    if (options.hasHeader === true) {
      headers = rows[0];
      dataRows = [];
    } else {
      headers = rows[0].map((_, i) => `Column ${i + 1}`);
      dataRows = rows;
    }
  } else {
    // No headers
    const maxCols = Math.max(...rows.map(r => r.length), 1);
    headers = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);
    dataRows = rows;
  }

  // Choose sensible default label column (first column or column with 'name' / 'title')
  let labelColIndex = 0;
  let sublabelColIndex = headers.length > 1 ? 1 : -1;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    if (h.includes('name') || h.includes('title') || h.includes('label')) {
      labelColIndex = i;
      break;
    }
  }

  const items: OrderedItem<CsvItemData>[] = dataRows.map((row, idx) => {
    const rowObj: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      rowObj[header] = row[colIdx] ?? '';
    });

    const labelVal = row[labelColIndex] || (row.length > 0 ? row.join(' | ') : `Row ${idx + 1}`);
    const sublabelVal = sublabelColIndex >= 0 && sublabelColIndex !== labelColIndex ? row[sublabelColIndex] : undefined;

    return {
      id: generateId(),
      originalIndex: idx,
      label: String(labelVal),
      sublabel: sublabelVal ? String(sublabelVal) : undefined,
      data: {
        row: rowObj,
        rawFields: row,
      },
    };
  });

  const csvMeta: CsvMetadata = {
    headers,
    delimiter,
    hasHeaderRow,
    selectedLabelColumn: headers[labelColIndex],
    selectedSublabelColumn: sublabelColIndex >= 0 ? headers[sublabelColIndex] : undefined,
  };

  return {
    id: generateId(),
    fileName,
    format: 'csv',
    items,
    originalContent: content,
    lineEnding,
    csvMeta,
  };
}
