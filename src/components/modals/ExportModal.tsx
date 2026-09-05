import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, Copy, Download, FileDown, X } from 'lucide-react';
import { getFileMimeType, serializeDocument } from '../../core/formatManager';
import { LineEnding, OrderedItem, ParsedDocument } from '../../types';

interface ExportModalProps {
  document: ParsedDocument;
  items: OrderedItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  document,
  items,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [fileName, setFileName] = useState(document.fileName);
  const [lineEnding, setLineEnding] = useState<LineEnding>(document.lineEnding || '\n');
  const [csvDelimiter, setCsvDelimiter] = useState(document.csvMeta?.delimiter || ',');
  const [csvIncludeHeaders, setCsvIncludeHeaders] = useState(document.csvMeta?.hasHeaderRow ?? true);
  const [copied, setCopied] = useState(false);

  const serializedContent = serializeDocument(document, items, {
    lineEnding,
    csvDelimiter,
    csvIncludeHeaders,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(serializedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const mimeType = getFileMimeType(document.format);
    const blob = new Blob([serializedContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = fileName || `ezOrder_${document.format}.${document.format}`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Trigger celebration confetti!
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.75 },
      });
    } catch {
      // Ignore if canvas confetti isn't supported in test env
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Export & Download
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Format: <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">{document.format}</span> • {items.length} reordered items
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Line Endings
              </label>
              <select
                value={lineEnding}
                onChange={(e) => setLineEnding(e.target.value as LineEnding)}
                className="w-full text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={'\n'}>LF (Unix / macOS / Linux)</option>
                <option value={'\r\n'}>CRLF (Windows)</option>
              </select>
            </div>

            {document.format === 'csv' && (
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  CSV Delimiter
                </label>
                <select
                  value={csvDelimiter}
                  onChange={(e) => setCsvDelimiter(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value={'\t'}>Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
            )}
          </div>

          {document.format === 'csv' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                id="headers-toggle"
                type="checkbox"
                checked={csvIncludeHeaders}
                onChange={(e) => setCsvIncludeHeaders(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <label htmlFor="headers-toggle" className="text-gray-700 dark:text-gray-300 cursor-pointer">
                Include column headers in exported CSV
              </label>
            </div>
          )}

          {/* Quick Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">
                Preview ({serializedContent.split(/\r?\n/).length} lines)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Preview'}</span>
              </button>
            </div>
            <div className="max-h-36 overflow-auto p-2.5 rounded-xl bg-gray-900 text-gray-100 font-mono text-[11px] leading-snug">
              <pre className="whitespace-pre-wrap break-all">{serializedContent}</pre>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-98 transition"
          >
            <Download className="w-4 h-4" />
            Download File
          </button>
        </div>
      </div>
    </div>
  );
};
