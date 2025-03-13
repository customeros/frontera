import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Archive } from '@ui/media/icons/Archive';
import { useStore } from '@shared/hooks/useStore';
import { Kbd, CommandKbd, CommandItem } from '@ui/overlay/CommandMenu';
import { CommandsContainer } from '@shared/components/CommandMenu/commands/shared';

export const TaskBulkCommands = observer(() => {
  const store = useStore();
  const selectedIds = store.ui.commandMenu.context.ids;

  const label = `${selectedIds?.length} tasks`;

  return (
    <CommandsContainer label={label}>
      <>
        <CommandItem
          keywords={[]}
          leftAccessory={<Archive />}
          onSelect={() => {
            store.ui.commandMenu.setType('DeleteConfirmationModal');
          }}
          rightAccessory={
            <>
              <CommandKbd />
              <Kbd>
                <Icon name='archive' className='size-3' />
              </Kbd>
            </>
          }
        >
          Archive tasks
        </CommandItem>
      </>
    </CommandsContainer>
  );
});
