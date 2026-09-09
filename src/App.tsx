import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileDropzone } from './components/dropzone/FileDropzone';
import { Navbar } from './components/layout/Navbar';
import { SortableList } from './components/list/SortableList';
import { ExportModal } from './components/modals/ExportModal';
import { ItemEditModal } from './components/modals/ItemEditModal';
import { LivePreviewDrawer } from './components/preview/LivePreviewDrawer';
import { Toolbar } from './components/toolbar/Toolbar';
import { parseDocument } from './core/formatManager';
import {
  moveItemsRelative,
  moveItemsToBottom,
  moveItemsToTop,
  reorderMultiple,
  reorderSingle,
  reverseItems,
  sortAlphabetical,
  sortByOriginal,
  shuffleItems,
} from './core/reorderUtils';
import { generateId } from './core/utils';
import { useHistory } from './hooks/useHistory';
import { OrderedItem, ParsedDocument } from './types';

export function App() {
  const [document, setDocument] = useState<ParsedDocument | null>(null);
  const {
    state: items,
    set: setItems,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useHistory<OrderedItem[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderedItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Dark mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ezorder_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('ezorder_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ezorder_theme', 'light');
    }
  }, [isDark]);

  // Load document handler
  const handleDocumentLoaded = (doc: ParsedDocument) => {
    setDocument(doc);
    resetHistory(doc.items);
    setSelectedIds(new Set());
    setLastSelectedId(null);
    setSearchTerm('');
  };

  const handleClear = () => {
    setDocument(null);
    resetHistory([]);
    setSelectedIds(new Set());
    setLastSelectedId(null);
    setSearchTerm('');
    setIsPreviewOpen(false);
    setIsExportOpen(false);
  };

  // Keyboard Shortcuts (Undo, Redo, Select All, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((cmdOrCtrl && e.key.toLowerCase() === 'y') || (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        redo();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'a' && document) {
        e.preventDefault();
        setSelectedIds(new Set(items.map((i) => i.id)));
      } else if (e.key === 'Escape') {
        if (isExportOpen) {
          setIsExportOpen(false);
        } else if (editingItem) {
          setEditingItem(null);
        } else if (selectedIds.size > 0) {
          setSelectedIds(new Set());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, document, items, isExportOpen, editingItem, selectedIds.size]);

  // Selection toggles (with Shift+Click range selection support)
  const handleToggleSelect = useCallback(
    (id: string, e: React.MouseEvent) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (e.shiftKey && lastSelectedId && lastSelectedId !== id) {
          const fromIdx = items.findIndex((i) => i.id === lastSelectedId);
          const toIdx = items.findIndex((i) => i.id === id);
          if (fromIdx !== -1 && toIdx !== -1) {
            const start = Math.min(fromIdx, toIdx);
            const end = Math.max(fromIdx, toIdx);
            for (let i = start; i <= end; i++) {
              next.add(items[i].id);
            }
            return next;
          }
        }

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      setLastSelectedId(id);
    },
    [items, lastSelectedId]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  }, [items]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  // Reorder Handler (Single & Multi-Item)
  const handleReorder = useCallback(
    (activeId: string, overId: string) => {
      const activeIndex = items.findIndex((i) => i.id === activeId);
      const overIndex = items.findIndex((i) => i.id === overId);
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return;

      if (selectedIds.has(activeId) && selectedIds.size > 1) {
        // Multi-drag: move all selected items together
        const reordered = reorderMultiple(items, selectedIds, overIndex);
        setItems(reordered);
      } else {
        // Single item drag
        const reordered = reorderSingle(items, activeIndex, overIndex);
        setItems(reordered);
      }
    },
    [items, selectedIds, setItems]
  );

  // Per-item single move
  const handleMoveUpSingle = useCallback(
    (id: string) => {
      const idx = items.findIndex((i) => i.id === id);
      if (idx > 0) {
        setItems(reorderSingle(items, idx, idx - 1));
      }
    },
    [items, setItems]
  );

  const handleMoveDownSingle = useCallback(
    (id: string) => {
      const idx = items.findIndex((i) => i.id === id);
      if (idx >= 0 && idx < items.length - 1) {
        setItems(reorderSingle(items, idx, idx + 1));
      }
    },
    [items, setItems]
  );

  // Batch Movement
  const handleMoveToTop = useCallback(() => {
    if (selectedIds.size === 0) return;
    setItems(moveItemsToTop(items, selectedIds));
  }, [items, selectedIds, setItems]);

  const handleMoveToBottom = useCallback(() => {
    if (selectedIds.size === 0) return;
    setItems(moveItemsToBottom(items, selectedIds));
  }, [items, selectedIds, setItems]);

  const handleMoveUpBatch = useCallback(() => {
    if (selectedIds.size === 0) return;
    setItems(moveItemsRelative(items, selectedIds, -1));
  }, [items, selectedIds, setItems]);

  const handleMoveDownBatch = useCallback(() => {
    if (selectedIds.size === 0) return;
    setItems(moveItemsRelative(items, selectedIds, 1));
  }, [items, selectedIds, setItems]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setItems(items.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, [items, selectedIds, setItems]);

  const handleDeleteSingle = useCallback(
    (id: string) => {
      setItems(items.filter((i) => i.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [items, setItems]
  );

  // Quick Sorting
  const handleSortAlphaAsc = useCallback(() => {
    setItems(sortAlphabetical(items, 'asc'));
  }, [items, setItems]);

  const handleSortAlphaDesc = useCallback(() => {
    setItems(sortAlphabetical(items, 'desc'));
  }, [items, setItems]);

  const handleReverse = useCallback(() => {
    setItems(reverseItems(items));
  }, [items, setItems]);

  const handleShuffle = useCallback(() => {
    setItems(shuffleItems(items));
  }, [items, setItems]);

  const handleResetOriginal = useCallback(() => {
    setItems(sortByOriginal(items, 'asc'));
  }, [items, setItems]);

  // Format adjustments
  const handleCsvLabelColumnChange = useCallback(
    (col: string) => {
      if (!document || document.format !== 'csv') return;
      setDocument({
        ...document,
        csvMeta: {
          ...document.csvMeta!,
          selectedLabelColumn: col,
        },
      });
      // Update label on items
      setItems(
        items.map((item) => {
          const row = (item.data as any).row as Record<string, string>;
          return {
            ...item,
            label: row[col] || item.label,
          };
        })
      );
    },
    [document, items, setItems]
  );

  const handleXmlTagChange = useCallback(
    (tag: string) => {
      if (!document || document.format !== 'xml') return;
      try {
        const customParsed = parseDocument(document.originalContent, document.fileName, 'xml');
        customParsed.xmlMeta!.itemTag = tag;
        setDocument(customParsed);
        resetHistory(customParsed.items);
        setSelectedIds(new Set());
      } catch {
        // Ignore
      }
    },
    [document, resetHistory]
  );

  // Add & Edit item
  const handleAddNewItem = () => {
    setIsAddingNew(true);
    let initialData: any = {};
    if (document?.format === 'csv' && document.csvMeta?.headers) {
      const row: Record<string, string> = {};
      document.csvMeta.headers.forEach((h) => {
        row[h] = '';
      });
      initialData = { row, rawFields: document.csvMeta.headers.map(() => '') };
    } else if (document?.format === 'm3u') {
      initialData = { title: '', uri: '', rawDirectives: [] };
    } else if (document?.format === 'xml') {
      initialData = {
        tagName: document.xmlMeta?.itemTag || 'item',
        attributes: {},
        innerContent: '',
        rawXml: '',
      };
    } else {
      initialData = { text: '' };
    }

    setEditingItem({
      id: generateId(),
      originalIndex: items.length,
      label: '',
      sublabel: '',
      data: initialData,
    });
  };

  const handleSaveItem = (
    updated: OrderedItem | OrderedItem[],
    insertPosition: 'top' | 'bottom' = 'bottom'
  ) => {
    const updatedArray = Array.isArray(updated) ? updated : [updated];

    if (isAddingNew) {
      if (insertPosition === 'top') {
        setItems([...updatedArray, ...items]);
      } else {
        setItems([...items, ...updatedArray]);
      }
      setIsAddingNew(false);
    } else {
      const single = updatedArray[0];
      setItems(items.map((i) => (i.id === single.id ? single : i)));
    }
    setEditingItem(null);
  };

  // Filtered items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(term))
    );
  }, [items, searchTerm]);

  // Count how many items moved relative to original order
  const movedCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].originalIndex !== i) {
        count++;
      }
    }
    return count;
  }, [items]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar
        document={document}
        selectedCount={selectedIds.size}
        movedCount={movedCount}
        isPreviewOpen={isPreviewOpen}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
        onOpenExport={() => setIsExportOpen(true)}
        onNewList={() => setDocument(null)}
        onClear={handleClear}
        onAddItem={handleAddNewItem}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!document ? (
          <FileDropzone onDocumentLoaded={handleDocumentLoaded} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Primary Workspace: Toolbar + Sortable List */}
            <div className="flex-1 w-full min-w-0">
              <Toolbar
                document={document}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCount={selectedIds.size}
                totalCount={items.length}
                onAddRow={handleAddNewItem}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onMoveToTop={handleMoveToTop}
                onMoveToBottom={handleMoveToBottom}
                onMoveUp={handleMoveUpBatch}
                onMoveDown={handleMoveDownBatch}
                onDeleteSelected={handleDeleteSelected}
                onSortAlphaAsc={handleSortAlphaAsc}
                onSortAlphaDesc={handleSortAlphaDesc}
                onReverse={handleReverse}
                onShuffle={handleShuffle}
                onResetOriginal={handleResetOriginal}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                onCsvLabelColumnChange={handleCsvLabelColumnChange}
                onXmlTagChange={handleXmlTagChange}
              />

              <SortableList
                items={items}
                filteredItems={filteredItems}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onReorder={handleReorder}
                onMoveUp={handleMoveUpSingle}
                onMoveDown={handleMoveDownSingle}
                onEditItem={(item) => {
                  setIsAddingNew(false);
                  setEditingItem(item);
                }}
                onDeleteItem={handleDeleteSingle}
                onAddRow={handleAddNewItem}
              />
            </div>

            {/* Live Preview Side Drawer */}
            <LivePreviewDrawer
              document={document}
              items={items}
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              onOpenExport={() => setIsExportOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Item Edit / Add Modal */}
      {editingItem && (
        <ItemEditModal
          isOpen={true}
          item={editingItem}
          document={document}
          isNew={isAddingNew}
          onClose={() => {
            setEditingItem(null);
            setIsAddingNew(false);
          }}
          onSave={handleSaveItem}
        />
      )}

      {/* Export & Download Modal */}
      {isExportOpen && document && (
        <ExportModal
          isOpen={true}
          document={document}
          items={items}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}

export default App;

