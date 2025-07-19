import { useState, useCallback } from 'react';

export function useUndo<T>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [undoStack, setUndoStack] = useState<T[][]>([]);
  const [redoStack, setRedoStack] = useState<T[][]>([]);

  const pushUndo = useCallback((currentData: T[]) => {
    setUndoStack((prev) => [...prev, currentData]);
    setRedoStack([]); // Clear redo stack when new action is performed
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const previousData = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    setRedoStack((prev) => [...prev, data]);
    setUndoStack(newUndoStack);
    setData(previousData);
  }, [undoStack, data]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextData = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setUndoStack((prev) => [...prev, data]);
    setRedoStack(newRedoStack);
    setData(nextData);
  }, [redoStack, data]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return {
    data,
    setData,
    pushUndo,
    undo,
    redo,
    canUndo,
    canRedo,
  };
} 