import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { OrderedItem, SupportedFormat } from '../../types';

interface ItemEditModalProps {
  item: OrderedItem | null;
  format: SupportedFormat;
  isNew?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: OrderedItem) => void;
}

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  item,
  format,
  isNew = false,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  const [label, setLabel] = useState(item.label);
  const [sublabel, setSublabel] = useState(item.sublabel || '');
  const [rawText, setRawText] = useState(
    format === 'txt'
      ? (item.data as any)?.text || item.label
      : format === 'm3u'
      ? (item.data as any)?.uri || ''
      : format === 'xml'
      ? (item.data as any)?.rawXml || ''
      : ''
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const updatedData = { ...item.data } as any;

    if (format === 'txt') {
      updatedData.text = rawText || label;
    } else if (format === 'm3u') {
      updatedData.title = label;
      if (rawText) updatedData.uri = rawText;
    } else if (format === 'xml') {
      if (rawText) updatedData.rawXml = rawText;
    }

    onSave({
      ...item,
      label: label.trim(),
      sublabel: sublabel.trim() || undefined,
      data: updatedData,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {isNew ? 'Add New Item' : 'Edit Item'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Title / Primary Label *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Item label..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Secondary Info / Sublabel (optional)
            </label>
            <input
              type="text"
              value={sublabel}
              onChange={(e) => setSublabel(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              placeholder="e.g. duration, tags, path..."
            />
          </div>

          {format === 'm3u' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Media Path / URI
              </label>
              <input
                type="text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="audio/track.mp3 or https://..."
              />
            </div>
          )}

          {format === 'xml' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Raw XML Element
              </label>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="<item>...</item>"
              />
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <Check className="w-3.5 h-3.5" />
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
