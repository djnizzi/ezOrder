import React, { useState, useEffect } from 'react';
import {
  Check,
  FileSpreadsheet,
  FileText,
  ListMusic,
  CodeXml,
  Plus,
  Trash2,
  X,
  Layers,
} from 'lucide-react';
import { generateId } from '../../core/utils';
import {
  CsvItemData,
  M3uItemData,
  OrderedItem,
  ParsedDocument,
  TxtItemData,
  XmlItemData,
} from '../../types';

interface ItemEditModalProps {
  isOpen: boolean;
  item: OrderedItem | null;
  document: ParsedDocument | null;
  isNew?: boolean;
  onClose: () => void;
  onSave: (
    itemsToAddOrUpdate: OrderedItem | OrderedItem[],
    insertPosition?: 'top' | 'bottom'
  ) => void;
}

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  isOpen,
  item,
  document,
  isNew = false,
  onClose,
  onSave,
}) => {
  if (!isOpen || !item || !document) return null;

  const format = document.format;
  const [insertPosition, setInsertPosition] = useState<'top' | 'bottom'>('bottom');

  // Generic fields
  const [label, setLabel] = useState(item.label || '');
  const [sublabel, setSublabel] = useState(item.sublabel || '');

  // CSV State
  const csvHeaders = document.csvMeta?.headers || [];
  const [csvValues, setCsvValues] = useState<Record<string, string>>(() => {
    if (format === 'csv' && item.data && (item.data as CsvItemData).row) {
      const r = (item.data as CsvItemData).row;
      if (Array.isArray(r)) {
        const obj: Record<string, string> = {};
        csvHeaders.forEach((h, idx) => {
          obj[h] = r[idx] ?? '';
        });
        return obj;
      }
      return { ...(r as Record<string, string>) };
    }
    const empty: Record<string, string> = {};
    csvHeaders.forEach((h) => {
      empty[h] = '';
    });
    return empty;
  });

  // TXT State (support single row or bulk rows)
  const [txtBulkMode, setTxtBulkMode] = useState(false);
  const [txtContent, setTxtContent] = useState(() => {
    if (format === 'txt') {
      return (item.data as TxtItemData)?.text || item.label || '';
    }
    return '';
  });
  const [txtBulkLines, setTxtBulkLines] = useState('');

  // M3U State
  const [m3uTitle, setM3uTitle] = useState(() => {
    if (format === 'm3u') {
      return (item.data as M3uItemData)?.title || item.label || '';
    }
    return '';
  });
  const [m3uUri, setM3uUri] = useState(() => {
    if (format === 'm3u') {
      return (item.data as M3uItemData)?.uri || '';
    }
    return '';
  });
  const [m3uDuration, setM3uDuration] = useState<string>(() => {
    if (format === 'm3u' && (item.data as M3uItemData)?.duration !== undefined) {
      return String((item.data as M3uItemData).duration);
    }
    return '';
  });
  const [m3uGroup, setM3uGroup] = useState(() => {
    if (format === 'm3u') {
      return (item.data as M3uItemData)?.groupTitle || '';
    }
    return '';
  });

  // XML State
  const xmlItemTag = document.xmlMeta?.itemTag || 'item';
  const [xmlContent, setXmlContent] = useState(() => {
    if (format === 'xml') {
      return (item.data as XmlItemData)?.innerContent || item.label || '';
    }
    return '';
  });
  const [xmlAttrs, setXmlAttrs] = useState<{ key: string; value: string }[]>(() => {
    if (format === 'xml' && (item.data as XmlItemData)?.attributes) {
      return Object.entries((item.data as XmlItemData).attributes).map(([key, value]) => ({
        key,
        value,
      }));
    }
    return [];
  });
  const [xmlRawOverride, setXmlRawOverride] = useState(() => {
    if (format === 'xml') {
      return (item.data as XmlItemData)?.rawXml || '';
    }
    return '';
  });
  const [xmlAdvancedMode, setXmlAdvancedMode] = useState(false);

  // Sync initial state when item changes
  useEffect(() => {
    setLabel(item.label || '');
    setSublabel(item.sublabel || '');
  }, [item]);

  const handleAddXmlAttr = () => {
    setXmlAttrs([...xmlAttrs, { key: '', value: '' }]);
  };

  const handleRemoveXmlAttr = (index: number) => {
    setXmlAttrs(xmlAttrs.filter((_, idx) => idx !== index));
  };

  const handleXmlAttrChange = (index: number, key: string, value: string) => {
    const updated = [...xmlAttrs];
    updated[index] = { key, value };
    setXmlAttrs(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (format === 'csv') {
      // Build row object & rawFields
      const rawFields = csvHeaders.map((h) => csvValues[h] || '');
      const primaryCol = document.csvMeta?.selectedLabelColumn || csvHeaders[0] || 'Column 1';
      const secondaryCol = document.csvMeta?.selectedSublabelColumn || (csvHeaders.length > 1 ? csvHeaders[1] : undefined);

      const computedLabel = csvValues[primaryCol] || rawFields.find((f) => f.trim()) || `Row ${item.originalIndex + 1}`;
      const computedSublabel = secondaryCol ? csvValues[secondaryCol] : undefined;

      const updatedItem: OrderedItem<CsvItemData> = {
        ...item,
        label: computedLabel,
        sublabel: computedSublabel,
        data: {
          row: { ...csvValues },
          rawFields,
        },
      };

      onSave(updatedItem, insertPosition);
      onClose();
      return;
    }

    if (format === 'txt') {
      if (isNew && txtBulkMode && txtBulkLines.trim()) {
        const lines = txtBulkLines.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) return;

        const newItems: OrderedItem<TxtItemData>[] = lines.map((line, idx) => ({
          id: generateId(),
          originalIndex: item.originalIndex + idx,
          label: line,
          data: { text: line },
        }));

        onSave(newItems, insertPosition);
        onClose();
        return;
      }

      const text = txtContent.trim() || label.trim() || '(empty line)';
      const updatedItem: OrderedItem<TxtItemData> = {
        ...item,
        label: text,
        sublabel: sublabel.trim() || undefined,
        data: { text },
      };

      onSave(updatedItem, insertPosition);
      onClose();
      return;
    }

    if (format === 'm3u') {
      const title = m3uTitle.trim() || label.trim() || 'Untitled Track';
      const uri = m3uUri.trim() || 'track.mp3';
      const durationSec = m3uDuration ? parseInt(m3uDuration, 10) || -1 : -1;

      // Format EXTINF directive
      const directives: string[] = [];
      const attrs: string[] = [];
      if (m3uGroup.trim()) {
        attrs.push(`group-title="${m3uGroup.trim()}"`);
      }
      const attrStr = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
      directives.push(`#EXTINF:${durationSec}${attrStr},${title}`);

      const sublabelParts: string[] = [];
      if (m3uGroup.trim()) sublabelParts.push(`[${m3uGroup.trim()}]`);
      if (durationSec > 0) {
        const mins = Math.floor(durationSec / 60);
        const secs = durationSec % 60;
        sublabelParts.push(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
      sublabelParts.push(uri);

      const updatedItem: OrderedItem<M3uItemData> = {
        ...item,
        label: title,
        sublabel: sublabelParts.join(' • '),
        data: {
          title,
          duration: durationSec > 0 ? durationSec : undefined,
          uri,
          groupTitle: m3uGroup.trim() || undefined,
          rawDirectives: directives,
        },
      };

      onSave(updatedItem, insertPosition);
      onClose();
      return;
    }

    if (format === 'xml') {
      if (xmlAdvancedMode && xmlRawOverride.trim()) {
        // Direct XML input
        const rawXml = xmlRawOverride.trim();
        const updatedItem: OrderedItem<XmlItemData> = {
          ...item,
          label: label.trim() || `<${xmlItemTag}>`,
          sublabel: sublabel.trim() || undefined,
          data: {
            tagName: xmlItemTag,
            attributes: {},
            innerContent: xmlContent,
            rawXml,
          },
        };
        onSave(updatedItem, insertPosition);
        onClose();
        return;
      }

      // Build XML from attributes and inner content
      const attrRecord: Record<string, string> = {};
      const attrPieces: string[] = [];
      for (const attr of xmlAttrs) {
        if (attr.key.trim()) {
          attrRecord[attr.key.trim()] = attr.value.trim();
          attrPieces.push(`${attr.key.trim()}="${attr.value.trim()}"`);
        }
      }
      const attrStr = attrPieces.length > 0 ? ` ${attrPieces.join(' ')}` : '';
      const content = xmlContent.trim();
      const rawXml = content
        ? `<${xmlItemTag}${attrStr}>${content}</${xmlItemTag}>`
        : `<${xmlItemTag}${attrStr}/>`;

      const computedLabel = label.trim() || content || attrRecord.name || attrRecord.title || attrRecord.id || `<${xmlItemTag}>`;

      const updatedItem: OrderedItem<XmlItemData> = {
        ...item,
        label: computedLabel,
        sublabel: attrPieces.length > 0 ? attrPieces.slice(0, 2).join(' ') : sublabel.trim() || undefined,
        data: {
          tagName: xmlItemTag,
          attributes: attrRecord,
          innerContent: content,
          rawXml,
        },
      };

      onSave(updatedItem, insertPosition);
      onClose();
      return;
    }

    // Default fallback
    onSave(
      {
        ...item,
        label: label.trim() || 'New Item',
        sublabel: sublabel.trim() || undefined,
      },
      insertPosition
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-200 dark:border-gray-700 my-8 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {format === 'csv' && <FileSpreadsheet className="w-5 h-5" />}
              {format === 'txt' && <FileText className="w-5 h-5" />}
              {format === 'm3u' && <ListMusic className="w-5 h-5" />}
              {format === 'xml' && <CodeXml className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {isNew ? `Add New ${format.toUpperCase()} Row` : `Edit ${format.toUpperCase()} Item`}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {document.fileName} • {isNew ? 'Will be appended to your list' : `Original #${item.originalIndex + 1}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Position Selector (when creating new row) */}
          {isNew && (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Insert Position:
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setInsertPosition('bottom')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    insertPosition === 'bottom'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  Append to Bottom
                </button>
                <button
                  type="button"
                  onClick={() => setInsertPosition('top')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    insertPosition === 'top'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  Insert at Top
                </button>
              </div>
            </div>
          )}

          {/* ================= CSV FORMAT INPUTS ================= */}
          {format === 'csv' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Column Fields ({csvHeaders.length} columns)
                </label>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  Delimiter: &ldquo;{document.csvMeta?.delimiter || ','}&rdquo;
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {csvHeaders.map((header) => {
                  const isPrimary = header === document.csvMeta?.selectedLabelColumn;
                  return (
                    <div key={header}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          {header}
                          {isPrimary && (
                            <span className="ml-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                              (Display Label)
                            </span>
                          )}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={csvValues[header] || ''}
                        onChange={(e) =>
                          setCsvValues({ ...csvValues, [header]: e.target.value })
                        }
                        placeholder={`Value for ${header}...`}
                        className="w-full text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TXT FORMAT INPUTS ================= */}
          {format === 'txt' && (
            <div className="space-y-3">
              {isNew && (
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Input Mode
                  </span>
                  <button
                    type="button"
                    onClick={() => setTxtBulkMode(!txtBulkMode)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{txtBulkMode ? 'Switch to Single Line' : 'Paste Multiple Lines (Bulk)'}</span>
                  </button>
                </div>
              )}

              {txtBulkMode && isNew ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Paste Multiple Lines (one row per line)
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={txtBulkLines}
                    onChange={(e) => setTxtBulkLines(e.target.value)}
                    placeholder="Enter or paste items here...&#10;Line 1&#10;Line 2&#10;Line 3"
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    Each non-empty line will be added as an independent sortable row.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Line Content *
                  </label>
                  <input
                    type="text"
                    required
                    value={txtContent}
                    onChange={(e) => {
                      setTxtContent(e.target.value);
                      setLabel(e.target.value);
                    }}
                    placeholder="Enter line text..."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* ================= M3U FORMAT INPUTS ================= */}
          {format === 'm3u' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Track Title *
                </label>
                <input
                  type="text"
                  required
                  value={m3uTitle}
                  onChange={(e) => {
                    setM3uTitle(e.target.value);
                    setLabel(e.target.value);
                  }}
                  placeholder="e.g. The Midnight - Sunset"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Media File Path or Stream URL *
                </label>
                <input
                  type="text"
                  required
                  value={m3uUri}
                  onChange={(e) => setM3uUri(e.target.value)}
                  placeholder="e.g. music/sunset.mp3 or https://stream..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Duration in Seconds (optional)
                  </label>
                  <input
                    type="number"
                    value={m3uDuration}
                    onChange={(e) => setM3uDuration(e.target.value)}
                    placeholder="e.g. 210"
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Group / Genre (optional)
                  </label>
                  <input
                    type="text"
                    value={m3uGroup}
                    onChange={(e) => setM3uGroup(e.target.value)}
                    placeholder="e.g. Synthwave"
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= XML FORMAT INPUTS ================= */}
          {format === 'xml' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Element Tag: <span className="font-mono text-indigo-600 dark:text-indigo-400">&lt;{xmlItemTag}&gt;</span>
                </span>
                <button
                  type="button"
                  onClick={() => setXmlAdvancedMode(!xmlAdvancedMode)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  {xmlAdvancedMode ? 'Standard Builder' : 'Raw XML Editor'}
                </button>
              </div>

              {xmlAdvancedMode ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Raw XML Element Markup
                  </label>
                  <textarea
                    rows={5}
                    value={xmlRawOverride}
                    onChange={(e) => setXmlRawOverride(e.target.value)}
                    placeholder={`<${xmlItemTag} id="1">Content</${xmlItemTag}>`}
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Inner Content / Text
                    </label>
                    <input
                      type="text"
                      value={xmlContent}
                      onChange={(e) => {
                        setXmlContent(e.target.value);
                        setLabel(e.target.value);
                      }}
                      placeholder="Item content or title..."
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Attributes (e.g. id=&quot;1&quot;)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddXmlAttr}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        <Plus className="w-3 h-3" />
                        Add Attribute
                      </button>
                    </div>

                    {xmlAttrs.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic">No attributes added.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {xmlAttrs.map((attr, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={attr.key}
                              onChange={(e) => handleXmlAttrChange(idx, e.target.value, attr.value)}
                              placeholder="attribute"
                              className="w-1/2 text-xs p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-mono"
                            />
                            <input
                              type="text"
                              value={attr.value}
                              onChange={(e) => handleXmlAttrChange(idx, attr.key, e.target.value)}
                              placeholder="value"
                              className="w-1/2 text-xs p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveXmlAttr(idx)}
                              className="p-1 text-gray-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-98 transition"
            >
              <Check className="w-4 h-4" />
              {isNew ? 'Add to List' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
