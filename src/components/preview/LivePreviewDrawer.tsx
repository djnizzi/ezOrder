import React, { useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import { ParsedDocument, OrderedItem } from '../../types';
import { serializeDocument } from '../../core/formatManager';

interface LivePreviewDrawerProps {
  document: ParsedDocument;
  items: OrderedItem[];
  isOpen: boolean;
  onClose: () => void;
  onOpenExport: () => void;
}

export const LivePreviewDrawer: React.FC<LivePreviewDrawerProps> = ({
  document,
  items,
  isOpen,
  onClose,
  onOpenExport,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const outputText = serializeDocument(document, items);
  const lineCount = outputText.split(/\r?\n/).length;
  const byteCount = new Blob([outputText]).size;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-lg overflow-hidden shrink-0 transition-all h-[calc(100vh-8rem)] sticky top-20">
      {/* Header */}
      <div className="p-3.5 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Live Preview
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
              {document.format}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
            {lineCount} lines • {byteCount} bytes
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Copy content to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Close preview panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Text Area */}
      <div className="flex-1 p-3 overflow-auto font-mono text-[11px] leading-relaxed bg-gray-900 text-gray-100 selection:bg-indigo-600 selection:text-white">
        <pre className="whitespace-pre-wrap break-all">{outputText}</pre>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">Updates in real-time</span>
        <button
          type="button"
          onClick={onOpenExport}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          <Download className="w-3 h-3" />
          Export File
        </button>
      </div>
    </div>
  );
};
