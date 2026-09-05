import React, { useRef, useState } from 'react';
import {
  Clipboard,
  FileSpreadsheet,
  FileText,
  ListMusic,
  CodeXml,
  UploadCloud,
  Sparkles,
  Check,
} from 'lucide-react';
import { parseDocument, SAMPLE_FILES } from '../../core/formatManager';
import { ParsedDocument } from '../../types';

interface FileDropzoneProps {
  onDocumentLoaded: (doc: ParsedDocument) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onDocumentLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [pasteFileName, setPasteFileName] = useState('pasted_list.txt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setErrorMessage('File is empty.');
          return;
        }
        const doc = parseDocument(text, file.name);
        onDocumentLoaded(doc);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to parse file.');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSample = (key: keyof typeof SAMPLE_FILES) => {
    const sample = SAMPLE_FILES[key];
    const doc = parseDocument(sample.content, sample.name);
    onDocumentLoaded(doc);
  };

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) {
      setErrorMessage('Please paste some text content first.');
      return;
    }
    try {
      const doc = parseDocument(pasteContent, pasteFileName);
      onDocumentLoaded(doc);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse pasted text.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal Drag & Drop List Ordering</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Effortlessly reorder your lists & files
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Drop any <strong>CSV</strong>, <strong>TXT</strong>, <strong>M3U</strong>, or <strong>XML</strong> file. 
          Reorder with drag-and-drop, quick-sort, bulk move, and export back with 100% format fidelity.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt,.m3u,.m3u8,.xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Drop your file here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Supports .csv, .txt, .m3u, .m3u8, and .xml (Client-side & 100% private)
        </p>

        {/* Format Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV / TSV
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <FileText className="w-3.5 h-3.5" /> Plain TXT
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ListMusic className="w-3.5 h-3.5" /> M3U / M3U8
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <CodeXml className="w-3.5 h-3.5" /> XML
          </span>
        </div>
      </div>

      {/* Paste Option toggle */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsPasting(!isPasting);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <Clipboard className="w-3.5 h-3.5" />
          {isPasting ? 'Hide clipboard paste box' : 'Or paste text directly from clipboard'}
        </button>
      </div>

      {/* Paste Dialog Card */}
      {isPasting && (
        <div className="mt-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Paste Raw List or Data</h4>
            <input
              type="text"
              value={pasteFileName}
              onChange={(e) => setPasteFileName(e.target.value)}
              placeholder="Filename (e.g. list.csv)"
              className="text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 w-44"
            />
          </div>
          <textarea
            rows={6}
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Paste CSV rows, plain lines, M3U playlist, or XML markup here..."
            className="w-full text-xs font-mono p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handlePasteSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <Check className="w-3.5 h-3.5" />
              Load Text
            </button>
          </div>
        </div>
      )}

      {/* Quick Start Sample Files */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Or try with sample files
          </span>
          <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleLoadSample('csv')}
            className="group flex flex-col items-start p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:scale-105 transition">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">Sample CSV</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">Tasks & Priorities</p>
          </button>

          <button
            type="button"
            onClick={() => handleLoadSample('txt')}
            className="group flex flex-col items-start p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-105 transition">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">Sample TXT</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">Grocery Items</p>
          </button>

          <button
            type="button"
            onClick={() => handleLoadSample('m3u')}
            className="group flex flex-col items-start p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:scale-105 transition">
                <ListMusic className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">Sample M3U</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">Synthwave Tracks</p>
          </button>

          <button
            type="button"
            onClick={() => handleLoadSample('xml')}
            className="group flex flex-col items-start p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover:scale-105 transition">
                <CodeXml className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">Sample XML</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">Podcast Episodes</p>
          </button>
        </div>
      </div>
    </div>
  );
};
