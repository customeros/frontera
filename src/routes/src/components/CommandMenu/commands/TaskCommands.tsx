import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { ArrowBlockUp } from '@ui/media/icons/ArrowBlockUp';
import { Kbd, CommandKbd, CommandItem } from '@ui/overlay/CommandMenu';
import { CommandsContainer } from '@shared/components/CommandMenu/commands/shared';

// TODO - uncomment keyboard shortcuts when they are implemented
export const TaskCommands = observer(() => {
  const store = useStore();
  const id = (store.ui.commandMenu.context.ids as string[])?.[0];
  const task = store.tasks.getById(id);
  const label = `Task - ${task?.value.subject}`;

  return (
    <CommandsContainer label={label}>
      <>
        <CommandItem
          keywords={taskKeywords.rename_task}
          leftAccessory={<Icon name='edit-03' />}
          onSelect={() => {
            store.ui.commandMenu.setType('RenameTask');
          }}
          rightAccessory={
            <>
              <Kbd>
                <ArrowBlockUp className='text-inherit size-3' />
              </Kbd>
              <Kbd>R</Kbd>
            </>
          }
        >
          Rename task
        </CommandItem>

        <CommandItem
          keywords={taskKeywords.change_task_status}
          leftAccessory={<Icon name='columns-03' />}
          onSelect={() => {
            store.ui.commandMenu.setType('ChangeTaskStatus');
          }}
          rightAccessory={
            <>
              <Kbd>
                <ArrowBlockUp className='text-inherit size-3' />
              </Kbd>
              <Kbd>S</Kbd>
            </>
          }
        >
          Change task status...
        </CommandItem>
        <CommandItem
          keywords={taskKeywords.assign_task}
          leftAccessory={<Icon name='user-01' />}
          onSelect={() => {
            store.ui.commandMenu.setType('AssignTask');
          }}
          rightAccessory={
            <>
              <Kbd>
                <ArrowBlockUp className='text-inherit size-3' />
              </Kbd>
              <Kbd>O</Kbd>
            </>
          }
        >
          Assign to...
        </CommandItem>
        <CommandItem
          keywords={taskKeywords.link_opportunity}
          leftAccessory={<Icon name='coins-stacked-01' />}
          onSelect={() => {
            store.ui.commandMenu.setType('LinkOpportunity');
          }}
        >
          Link opportunity...
        </CommandItem>
        <CommandItem
          keywords={taskKeywords.set_due_date}
          leftAccessory={<Icon name='clock-fast-forward' />}
          onSelect={() => {
            store.ui.commandMenu.setType('SetDueDate');
          }}
          rightAccessory={
            <>
              <CommandKbd />
              <Kbd>D</Kbd>
            </>
          }
        >
          Set due date...
        </CommandItem>

        <CommandItem
          rightAccessory={<Kbd className='size-auto h-5 px-1.5'>Space</Kbd>}
          leftAccessory={
            <Icon name={store.ui.showPreviewCard ? 'eye-off' : 'eye'} />
          }
          onSelect={() => {
            store.ui.setShowPreviewCard(!store.ui.showPreviewCard);
            store.ui.commandMenu.setOpen(false);
          }}
        >
          {store.ui.showPreviewCard ? 'Hide task preview' : 'Preview task'}
        </CommandItem>
        <CommandItem
          keywords={taskKeywords.archive_task}
          leftAccessory={<Icon name='archive' />}
          onSelect={() => {
            store.ui.commandMenu.setType('DeleteConfirmationModal');
          }}
          rightAccessory={
            <>
              <CommandKbd />
              <Kbd>D</Kbd>
            </>
          }
        >
          Archive task
        </CommandItem>
      </>
    </CommandsContainer>
  );
});

const taskKeywords = {
  rename_task: ['rename', 'task', 'edit', 'update', 'name', 'change', 'title'],
  change_task_status: ['change', 'status', 'update', 'edit'],
  assign_task: ['assign', 'task', 'owner'],
  link_opportunity: ['link', 'opportunity', 'deal'],
  set_due_date: ['set', 'due', 'date', 'time', 'remind'],
  archive_task: ['archive', 'task', 'delete', 'remove', 'hide'],
};
