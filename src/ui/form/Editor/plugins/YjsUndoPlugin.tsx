import { useEffect } from 'react';

import { UndoManager } from 'yjs';

export const YjsUndoPlugin = ({
  undoManager,
  onUndoStateChange,
}: {
  undoManager: UndoManager | null;
  onUndoStateChange?: (canUndo: boolean, canRedo: boolean) => void;
}) => {
  useEffect(() => {
    if (!undoManager) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'z' &&
        !event.shiftKey
      ) {
        event.preventDefault();
        undoManager.undo();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'z' &&
        event.shiftKey
      ) {
        event.preventDefault();
        undoManager.redo();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        event.preventDefault();
        undoManager.redo();
      }
    };

    // Update undo state whenever it changes
    const updateUndoState = () => {
      if (onUndoStateChange) {
        const canUndo = undoManager.canUndo();
        const canRedo = undoManager.canRedo();

        onUndoStateChange(canUndo, canRedo);
      }
    };

    // Initial state update
    updateUndoState();

    // Listen for stack changes
    undoManager.on('stack-item-added', updateUndoState);
    undoManager.on('stack-item-popped', updateUndoState);
    undoManager.on('stack-cleared', updateUndoState);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      undoManager.off('stack-item-added', updateUndoState);
      undoManager.off('stack-item-popped', updateUndoState);
      undoManager.off('stack-cleared', updateUndoState);
    };
  }, [undoManager, onUndoStateChange]);

  return null;
};
