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
          keywords={['']}
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
          keywords={['']}
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
          keywords={['']}
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
          keywords={['']}
          leftAccessory={<Icon name='coins-stacked-01' />}
          onSelect={() => {
            store.ui.commandMenu.setType('LinkOpportunity');
          }}
        >
          Link opportunity...
        </CommandItem>
        <CommandItem
          keywords={['']}
          leftAccessory={<Icon name='clock-fast-forward' />}
          onSelect={() => {
            store.ui.commandMenu.setType('SetDueDate');
          }}
          rightAccessory={
            <>
              <CommandKbd />
              <Kbd>
                <Icon name='delete' />
              </Kbd>
            </>
          }
        >
          Set due date...
        </CommandItem>
      </>
    </CommandsContainer>
  );
});
