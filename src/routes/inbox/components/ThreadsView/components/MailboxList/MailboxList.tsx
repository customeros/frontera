import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Menu } from '@ui/overlay/Menu/Menu';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

export const MailboxList = observer(() => {
  const store = useStore();

  const mailboxList = store.mailboxes.toArray();

  return (
    <div className='flex items-start'>
      <div className='flex flex-col  mb-[-1px] mt-0 flex-1 overflow-visible'>
        <div className='flex flex-col'>
          <div>
            <span className='text-grayModern-700 font-semibold text-sm mr-1'>
              CC:
            </span>
          </div>
          <div>
            <span className='text-grayModern-700 font-semibold text-sm mr-1'>
              BCC:
            </span>
          </div>
        </div>
        <div>
          <span className='font-semibold text-sm'>From:</span>
          <Menu>
            <MenuButton asChild>
              <Button
                size='sm'
                variant='ghost'
                className='ml-[-3px]'
                rightIcon={<Icon name='chevron-down' />}
              >
                Nic Fassbender • nic@acme.com
              </Button>
            </MenuButton>
            <MenuList>
              {mailboxList.map((mailbox) => (
                <MenuItem key={mailbox.id}>{mailbox.value.mailbox}</MenuItem>
              ))}
            </MenuList>
          </Menu>
        </div>
      </div>
      <div className='flex'>
        <Button size='xxs' variant='ghost'>
          CC
        </Button>
        <Button size='xxs' variant='ghost'>
          BCC
        </Button>
      </div>
    </div>
  );
});
