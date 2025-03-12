import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { EditTaskUsecase } from '@domain/usecases/command-menu/task/edit-task.usecase';

import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Command, CommandItem, CommandInput } from '@ui/overlay/CommandMenu';

export const AssignTask = observer(() => {
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

  const users = store.users.tenantUsers;

  return (
    <Command shouldFilter={false} label='Assign task...'>
      <CommandInput
        label={label}
        placeholder='Asign to...'
        value={usecase.searchTerm}
        onValueChange={usecase.setSearchTerm}
        onKeyDownCapture={(e) => {
          if (e.key === ' ') {
            e.stopPropagation();
          }
        }}
      />
      <Command.List>
        {users
          .filter((user) =>
            user.value.name
              ?.toLowerCase()
              .includes(usecase.searchTerm.toLowerCase()),
          )
          .map((user) => (
            <CommandItem
              key={user.value.id}
              rightAccessory={
                task?.value.assignees.includes(user.value.id) ? (
                  <Icon name='check' />
                ) : null
              }
              onSelect={() => {
                usecase.setProperty('assignees', user.value.id);
                usecase.execute();
                handleClose();
              }}
            >
              {user.value.name}
            </CommandItem>
          ))}
      </Command.List>
    </Command>
  );
});
