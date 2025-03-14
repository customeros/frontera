import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { EditTaskUsecase } from '@domain/usecases/command-menu/task/edit-task.usecase';

import { Icon, IconName } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { TaskStatus as TaskStatusEnum } from '@graphql/types';
import { TaskStatus } from '@shared/types/__generated__/graphql.types';
import { Command, CommandItem, CommandInput } from '@ui/overlay/CommandMenu';
const statusIcons = {
  [TaskStatusEnum.Todo]: 'circle',
  [TaskStatusEnum.InProgress]: 'hourglass-02',
  [TaskStatusEnum.Done]: 'check',
};

export const ChangeTaskStatus = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const task = store.tasks.value.get(context.ids?.[0] as string);

  const label = `Task - ${task?.value.subject}`;

  if (!task) return;

  const usecase = useMemo(() => new EditTaskUsecase(task), [task]);

  const handleClose = () => {
    store.ui.commandMenu.setOpen(false);
    store.ui.commandMenu.setType('TaskCommands');
  };

  const statuses = [
    { label: 'Todo', value: TaskStatus.Todo },
    { label: 'In progress', value: TaskStatus.InProgress },
    { label: 'Done', value: TaskStatus.Done },
  ];

  return (
    <Command shouldFilter={false} label='Change task status...'>
      <CommandInput
        label={label}
        value={usecase.searchTerm}
        placeholder='Change task status...'
        onValueChange={usecase.setSearchTerm}
        onKeyDownCapture={(e) => {
          if (e.key === ' ') {
            e.stopPropagation();
          }
        }}
      />
      <Command.List>
        {statuses
          .filter((status) =>
            status.label
              .toLowerCase()
              .includes(usecase.searchTerm.toLowerCase()),
          )
          .map((status) => (
            <CommandItem
              key={status.value}
              rightAccessory={
                task?.value.status === status.value ? (
                  <Icon name='check' />
                ) : null
              }
              onSelect={() => {
                usecase.setProperty('status', status.value);
                usecase.execute();
                handleClose();
              }}
            >
              <div className='flex items-center gap-2'>
                <Icon name={statusIcons[status.value] as IconName} />
                {status.label}
              </div>
            </CommandItem>
          ))}
      </Command.List>
    </Command>
  );
});
