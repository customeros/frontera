import { useMemo } from 'react';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { AddTaskToOpportunityUsecase } from '@domain/usecases/command-menu/add-task-to-opportunity.usecase';

import { useStore } from '@shared/hooks/useStore';
import { Command, CommandItem, CommandInput } from '@ui/overlay/CommandMenu';
export const SetOpportunityTask = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const opportunity = store.opportunities.value.get(
    (context.ids as string[])?.[0],
  );

  const usecase = useMemo(() => {
    if (!opportunity) return null;

    return new AddTaskToOpportunityUsecase(opportunity);
  }, [opportunity]);

  const label = match(context.entity)
    .with('Opportunity', () => `Opportunity - ${opportunity?.value?.name}`)
    .otherwise(() => 'Change ARR estimate');

  const tasks = Array.from(store.tasks.value.values()).filter((task) =>
    task.value.subject
      ?.toLowerCase()
      .includes(usecase?.taskName.toLowerCase() ?? ''),
  );

  const handleSelect = (taskId: string) => () => {
    usecase?.setTaskId(taskId);
    usecase?.execute();
    store.ui.commandMenu.setOpen(false);
    store.ui.commandMenu.setType('OpportunityHub');
    store.ui.setShowPreviewCard(true);
    store.ui.setFocusRow(usecase?.taskId ?? null);
  };

  return (
    <Command shouldFilter={false}>
      <CommandInput
        label={label}
        value={usecase?.taskName}
        placeholder='Link a task'
        onValueChange={usecase?.setTaskName}
      />

      <Command.List className='p-0'>
        {tasks.map((task) => (
          <CommandItem
            key={task.id}
            onSelect={handleSelect(task.id)}
            dataValue={`${task.value.subject} - ${task.id}`}
          >
            {task.value.subject}
          </CommandItem>
        ))}
      </Command.List>
    </Command>
  );
});
