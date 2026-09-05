import Papa from 'papaparse';
import { CsvItemData, CsvMetadata, LineEnding, OrderedItem } from '../../types';

export interface CsvSerializerOptions {
  delimiter?: string;
  lineEnding?: LineEnding;
  includeHeaders?: boolean;
}

export function serializeCsv(
  items: OrderedItem<CsvItemData>[],
  meta?: CsvMetadata,
  defaultLineEnding: LineEnding = '\n',
  options: CsvSerializerOptions = {}
): string {
  const delimiter = options.delimiter ?? meta?.delimiter ?? ',';
  const includeHeaders = options.includeHeaders ?? meta?.hasHeaderRow ?? true;
  const newline = options.lineEnding ?? defaultLineEnding;

  const fields = meta?.headers && meta.headers.length > 0 ? meta.headers : [];

  let dataMatrix: (string | number | boolean)[][] = [];

  if (includeHeaders && fields.length > 0) {
    dataMatrix.push(fields);
  }

  for (const item of items) {
    if (Array.isArray(item.data.rawFields) && item.data.rawFields.length > 0) {
      dataMatrix.push(item.data.rawFields);
    } else if (typeof item.data.row === 'object' && fields.length > 0) {
      const rowRecord = item.data.row as Record<string, string>;
      const row = fields.map((f) => rowRecord[f] ?? '');
      dataMatrix.push(row);
    }
  }

  return Papa.unparse(dataMatrix, {
    delimiter,
    newline,
  });
}
