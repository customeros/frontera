import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon, IconName } from '@ui/media/Icon';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

interface DocumentListItemProps {
  id: string;
  isActive: boolean;
  onRename: () => void;
  onArchive: () => void;
  onClick: (id: string) => void;
}

export const DocumentListItem = observer(
  ({
    id,
    onClick,
    onRename,
    onArchive,
    isActive = false,
  }: DocumentListItemProps) => {
    const store = useStore();

    const doc = store.documents.getById(id);

    if (!doc) return null;

    return (
      <div
        onClick={() => onClick(doc.id)}
        className={cn(
          'flex relative gap-3 items-center py-1 px-2 cursor-pointer transition-colors hover:bg-grayModern-100 rounded group',
          isActive && 'bg-grayModern-100',
        )}
      >
        <Icon name={doc.value.icon as IconName} />
        <p className='text-sm truncate'>{doc.value.name}</p>

        <Menu
          onOpenChange={(v) => {
            onClick(doc.id);
          }}
        >
          <MenuButton asChild>
            <IconButton
              size='xxs'
              variant='ghost'
              aria-label='more actions'
              icon={<Icon name='dots-vertical' />}
              className='invisible data-[state="open"]:visible group-hover:visible'
            />
          </MenuButton>
          <MenuList align='start'>
            <MenuItem onClick={onRename} className='group/rename'>
              <Icon
                name='edit-03'
                className='text-grayModern-500 group-hover/rename:text-grayModern-700'
              />{' '}
              Rename
            </MenuItem>
            <MenuItem onClick={onArchive} className='group/archive'>
              <Icon
                name='archive'
                className='text-grayModern-500 group-hover/archive:text-grayModern-700'
              />{' '}
              Archive
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    );
  },
);
