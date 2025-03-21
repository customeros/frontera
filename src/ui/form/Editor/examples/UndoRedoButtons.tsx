import React from 'react';

interface UndoRedoButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  className?: string;
  disabledClassName?: string;
  undoButtonClassName?: string;
  redoButtonClassName?: string;
  undoRedoRef: React.MutableRefObject<{
    undo: () => void;
    redo: () => void;
  } | null>;
}

/** This is a basix example of how to implement external undo/redo buttons. It should be adapted to our own style */
export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
  className = '',
  undoButtonClassName = 'p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50',
  redoButtonClassName = 'p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50',
  disabledClassName = 'opacity-50 cursor-not-allowed',
  canUndo,
  canRedo,
  undoRedoRef,
}) => {
  const handleUndo = () => {
    if (canUndo && undoRedoRef.current) {
      undoRedoRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (canRedo && undoRedoRef.current) {
      undoRedoRef.current.redo();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        title='Undo'
        disabled={!canUndo}
        onClick={handleUndo}
        className={`${undoButtonClassName} ${
          !canUndo ? disabledClassName : ''
        }`}
      >
        <svg
          width='16'
          height='16'
          fill='none'
          strokeWidth='2'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M3 7v6h6'></path>
          <path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13'></path>
        </svg>
      </button>
      <button
        title='Redo'
        disabled={!canRedo}
        onClick={handleRedo}
        className={`${redoButtonClassName} ${
          !canRedo ? disabledClassName : ''
        }`}
      >
        <svg
          width='16'
          height='16'
          fill='none'
          strokeWidth='2'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M21 7v6h-6'></path>
          <path d='M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13'></path>
        </svg>
      </button>
    </div>
  );
};

// Example usage with Editor:
/*
import { Editor } from './Editor';
import { UndoRedoButtons } from './UndoRedoButtons';
import { useRef, useState } from 'react';

const MyEditor = () => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undoRedoRef = useRef(null);

  return (
    <div>
      <UndoRedoButtons
        undoRedoRef={undoRedoRef}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <Editor
        useYjs={true}
        namespace="my-editor"
        undoRef={undoRedoRef}
        onUndoStateChange={(canUndo, canRedo) => {
          setCanUndo(canUndo);
          setCanRedo(canRedo);
        }}
      />
    </div>
  );
};
*/
