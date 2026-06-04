import { useCallback, useRef, useState } from 'react';

/**
 * Generic undo/redo state hook.
 * Returns [state, set, { undo, redo, canUndo, canRedo, reset }]
 */
export function useHistoryState<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const [, force] = useState(0);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setState(prev => {
      const value = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      past.current.push(prev);
      if (past.current.length > 50) past.current.shift();
      future.current = [];
      force(n => n + 1);
      return value;
    });
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    setState(prev => {
      const previous = past.current.pop()!;
      future.current.push(prev);
      force(n => n + 1);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    setState(prev => {
      const next = future.current.pop()!;
      past.current.push(prev);
      force(n => n + 1);
      return next;
    });
  }, []);

  const reset = useCallback((value: T) => {
    past.current = [];
    future.current = [];
    setState(value);
    force(n => n + 1);
  }, []);

  return [
    state,
    set,
    {
      undo,
      redo,
      canUndo: past.current.length > 0,
      canRedo: future.current.length > 0,
      reset,
    },
  ] as const;
}
