import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { User01 } from '@ui/media/icons/User01';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Archive } from '@ui/media/icons/Archive';
import { DotsVertical } from '@ui/media/icons/DotsVertical';
import { CurrencyDollarCircle } from '@ui/media/icons/CurrencyDollarCircle';
import { Menu, MenuList, MenuItem, MenuButton } from '@ui/overlay/Menu/Menu';

interface MoreMenuProps {
  hasTask: boolean;
  dataTest?: string;
  onAddTaskClick: () => void;
}

export const MoreMenu = observer(
  ({ hasTask, onAddTaskClick }: MoreMenuProps) => {
    const store = useStore();

    return (
      <Menu>
        <MenuButton asChild>
          <IconButton
            size='xxs'
            variant='ghost'
            icon={<DotsVertical />}
            aria-label='more options'
            dataTest={`opp-kanban-card-dots`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        </MenuButton>

        <MenuList data-test={'opp-kanban-card-operations'}>
          <MenuItem onClick={onAddTaskClick}>
            {<Icon name={hasTask ? 'link-broken-02' : 'clipboard-text'} />}
            {hasTask ? 'Unlink task' : 'Link a task'}
          </MenuItem>
          <MenuItem onClick={() => store.ui.commandMenu.toggle('AssignOwner')}>
            <User01 />
            Assign owner
          </MenuItem>
          <MenuItem
            onClick={() => store.ui.commandMenu.toggle('ChangeCurrency')}
          >
            <CurrencyDollarCircle />
            Change currency
          </MenuItem>
          <MenuItem
            onClick={() =>
              store.ui.commandMenu.toggle('DeleteConfirmationModal')
            }
          >
            <Archive />
            Archive
          </MenuItem>
        </MenuList>
      </Menu>
    );
  },
);
