export type SupportedFormat = 'csv' | 'txt' | 'm3u' | 'xml';

export type LineEnding = '\r\n' | '\n';

export interface BaseListItem {
  id: string;
  originalIndex: number;
  label: string;
  sublabel?: string;
}

export interface TxtItemData {
  text: string;
}

export interface CsvItemData {
  row: Record<string, string> | string[];
  rawFields: string[];
}

export interface M3uItemData {
  title: string;
  duration?: number;
  uri: string;
  groupTitle?: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  rawDirectives: string[];
}

export interface XmlItemData {
  tagName: string;
  attributes: Record<string, string>;
  innerContent: string;
  rawXml: string;
}

export interface OrderedItem<T = TxtItemData | CsvItemData | M3uItemData | XmlItemData> extends BaseListItem {
  data: T;
}

export interface CsvMetadata {
  headers: string[];
  delimiter: string;
  hasHeaderRow: boolean;
  selectedLabelColumn?: string;
  selectedSublabelColumn?: string;
}

export interface M3uMetadata {
  headerTag: string; // e.g. #EXTM3U
  globalDirectives: string[];
}

export interface XmlMetadata {
  declaration?: string; // e.g. <?xml version="1.0" encoding="UTF-8"?>
  rootTag: string;
  rootAttributes: Record<string, string>;
  itemTag: string;
  availableItemTags: { tag: string; count: number }[];
  beforeItemsXml: string;
  afterItemsXml: string;
}

export interface ParsedDocument {
  id: string;
  fileName: string;
  format: SupportedFormat;
  items: OrderedItem[];
  originalContent: string;
  lineEnding: LineEnding;
  csvMeta?: CsvMetadata;
  m3uMeta?: M3uMetadata;
  xmlMeta?: XmlMetadata;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'label' | 'sublabel' | 'originalIndex';
