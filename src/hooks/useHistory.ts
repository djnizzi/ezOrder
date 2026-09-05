import { useCallback, useState } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialPresent: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const set = useCallback((newPresent: T | ((curr: T) => T)) => {
    setHistory((curr) => {
      const resolved = typeof newPresent === 'function' ? (newPresent as (c: T) => T)(curr.present) : newPresent;
      if (resolved === curr.present) return curr;
      return {
        past: [...curr.past, curr.present],
        present: resolved,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setHistory({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historyLength: history.past.length,
  };
}
