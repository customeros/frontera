import { useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { useKeys, useKeyBindings } from 'rooks';
import { Contact } from '@store/Contacts/Contact.dto';
import { CommandMenuType } from '@store/UI/CommandMenu.store.ts';

import { useStore } from '@shared/hooks/useStore';
import { useModKey } from '@shared/hooks/useModKey';
import { TableInstance } from '@ui/presentation/Table';

import { SharedTableActions } from './components/SharedActions';

interface TableActionsProps {
  selection: string[];
  focusedId?: string | null;
  isCommandMenuOpen: boolean;
  table: TableInstance<Contact>;
  enableKeyboardShortcuts?: boolean;
}

export const TaskTableActions = observer(
  ({
    table,
    enableKeyboardShortcuts,
    focusedId,
    selection,
  }: TableActionsProps) => {
    const [targetId, setTargetId] = useState<string | null>(null);
    const store = useStore();
    const selectCount = selection?.length;

    const clearSelection = () => table.resetRowSelection();

    const onOpenCommandK = () => {
      if (selection?.length === 1) {
        store.ui.commandMenu.setType('TaskCommands');
        store.ui.commandMenu.setContext({
          entity: 'Task',
          ids: selection,
        });
        store.ui.commandMenu.setOpen(true);
      } else {
        store.ui.commandMenu.setType('TaskBulkCommands');
        store.ui.commandMenu.setContext({
          entity: 'Tasks',
          ids: selection,
        });
        store.ui.commandMenu.setOpen(true);
      }
    };

    const handleOpen = (type: CommandMenuType, property?: string) => {
      if (selection?.length >= 1) {
        store.ui.commandMenu.setContext({
          ids: selection,
          entity: 'Task',
          property: property,
        });
      } else {
        store.ui.commandMenu.setContext({
          ids: [focusedId || ''],
          entity: 'Task',
          property: property,
        });
      }

      if (selection?.length === 1) {
        store.ui.commandMenu.setContext({
          ids: selection,
          entity: 'Task',
          property: property,
        });
      }

      store.ui.commandMenu.setType(type);
      store.ui.commandMenu.setOpen(true);
    };

    const onHideTasks = () => {
      store.ui.commandMenu.setType('DeleteConfirmationModal');
      store.ui.commandMenu.setOpen(true);

      if (store.ui.showPreviewCard) {
        store.ui.showPreviewCard = false;
      }
      store.ui.commandMenu.setCallback(() => {
        clearSelection();
      });
    };

    useEffect(() => {
      if (selectCount === 1) {
        setTargetId(selection[0]);
      }

      if (selectCount < 1) {
        setTargetId(null);
      }
    }, [selectCount, focusedId]);

    useKeys(
      ['Shift', 'R'],
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleOpen('RenameTask');
      },
      { when: enableKeyboardShortcuts },
    );

    useKeys(
      ['Shift', 'S'],
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleOpen('ChangeTaskStatus');
      },
      { when: enableKeyboardShortcuts && (selectCount === 1 || !!focusedId) },
    );

    useKeys(
      ['Shift', 'O'],
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleOpen('AssignTask');
      },
      { when: enableKeyboardShortcuts },
    );

    useKeys(
      ['Shift', 'D'],
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleOpen('SetDueDate');
      },
      { when: enableKeyboardShortcuts },
    );

    useModKey(
      'Backspace',
      () => {
        onHideTasks();
      },
      { when: enableKeyboardShortcuts },
    );

    useKeyBindings(
      {
        Escape: clearSelection,
      },
      { when: enableKeyboardShortcuts },
    );

    if (!selectCount && !targetId) return null;

    return (
      <SharedTableActions
        table={table}
        onHide={onHideTasks}
        handleOpen={handleOpen}
        selectCount={selectCount}
        onOpenCommandK={onOpenCommandK}
      />
    );
  },
);
