import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { EditTaskUsecase } from '@domain/usecases/command-menu/task/edit-task.usecase';

import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Command, CommandItem, CommandInput } from '@ui/overlay/CommandMenu';

export const LinkOpportunity = observer(() => {
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

  const opportunities = store.opportunities.toArray();

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
        {opportunities
          .filter((op) =>
            op.value.name
              ?.toLowerCase()
              .includes(usecase.searchTerm.toLowerCase()),
          )
          .map((op) => (
            <CommandItem
              key={op.value.id}
              dataValue={`${op.value.name} - ${op.value.id}`}
              rightAccessory={
                task?.value.opportunityIds.includes(op.value.id) ? (
                  <Icon name='check' />
                ) : null
              }
              onSelect={() => {
                usecase.setProperty('opportunityIds', op.value.id);
                usecase.execute();
                handleClose();
              }}
            >
              {op.value.name}
            </CommandItem>
          ))}
      </Command.List>
    </Command>
  );
});
