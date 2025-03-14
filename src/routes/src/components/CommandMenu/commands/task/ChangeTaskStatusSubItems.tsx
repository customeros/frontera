import { useMemo } from 'react';

import { EditTaskUsecase } from '@domain/usecases/command-menu/task/edit-task.usecase';

import { Icon } from '@ui/media/Icon';
import { Check } from '@ui/media/icons/Check';
import { useStore } from '@shared/hooks/useStore';
import { CommandSubItem } from '@ui/overlay/CommandMenu';
import { TaskStatus } from '@shared/types/__generated__/graphql.types';

export const ChangeTaskStatusSubItems = () => {
  const store = useStore();
  const task = store.tasks.value.get(
    store.ui.commandMenu.context.ids?.[0] as string,
  );

  const usecase = useMemo(() => new EditTaskUsecase(task!), [task]);

  return (
    <>
      <CommandSubItem
        rightLabel='Todo'
        keywords={['todo']}
        leftLabel='Change task status'
        icon={<Icon name='columns-03' />}
        rightAccessory={
          task?.value.status === TaskStatus.Todo ? <Check /> : null
        }
        onSelectAction={() => {
          usecase.setProperty('status', TaskStatus.Todo);
          usecase.execute();
          store.ui.commandMenu.setType('TaskCommands');
          store.ui.commandMenu.setOpen(false);
        }}
      />

      <CommandSubItem
        rightLabel='In progress'
        keywords={['in progress']}
        leftLabel='Change task status'
        icon={<Icon name='columns-03' />}
        rightAccessory={
          task?.value.status === TaskStatus.InProgress ? <Check /> : null
        }
        onSelectAction={() => {
          usecase.setProperty('status', TaskStatus.InProgress);
          usecase.execute();
          store.ui.commandMenu.setType('TaskCommands');
          store.ui.commandMenu.setOpen(false);
        }}
      />

      <CommandSubItem
        rightLabel='Done'
        keywords={['done']}
        leftLabel='Change task status'
        icon={<Icon name='columns-03' />}
        rightAccessory={
          task?.value.status === TaskStatus.Done ? <Check /> : null
        }
        onSelectAction={() => {
          usecase.setProperty('status', TaskStatus.Done);
          usecase.execute();
          store.ui.commandMenu.setType('TaskCommands');
          store.ui.commandMenu.setOpen(false);
        }}
      />
    </>
  );
};
