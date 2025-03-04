import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Logo } from '@ui/media/Logo';
import { Table } from '@ui/presentation/Table';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { Microsoft } from '@ui/media/logos/Microsoft';
import { LinkExternal01 } from '@ui/media/icons/LinkExternal01';
import { Menu, MenuList, MenuItem, MenuButton } from '@ui/overlay/Menu/Menu';

import { columns } from './columns';

export const MailboxTable = observer(() => {
  const store = useStore();
  const navigate = useNavigate();
  const flowsPreset = store.tableViewDefs.flowsPreset;

  const goToBuy = () => navigate('/settings?tab=mailboxes&view=outbound');

  const data = store.mailboxes.toArray().map((v) => v.value);

  return (
    <div className='w-full'>
      <div className='pl-6 pr-3 pt-[5px] pb-[5px] flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 data-test='mailboxes-header' className='font-semibold text-md'>
            Mailboxes
          </h2>
          <Button
            size='xxs'
            rightIcon={<LinkExternal01 className='size-3' />}
            onClick={() => navigate(`/finder?preset=${flowsPreset}`)}
          >
            Jump to flows
          </Button>
        </div>

        <Menu>
          <MenuButton asChild>
            <Button
              size='xs'
              colorScheme='primary'
              leftIcon={<Icon name='plus' />}
            >
              Mailboxes
            </Button>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={goToBuy}>
              <div className='flex items-center gap-2'>
                <Icon name='plus' className='mr-2' />
                Buy new mailboxes
              </div>
            </MenuItem>
            <MenuItem
              className='text-sm'
              onClick={() => store.settings.oauthToken.enableSync('google')}
            >
              <Logo name='google' className='mr-1 size-5' />
              Google Workspace
            </MenuItem>
            <MenuItem
              className='text-sm'
              onClick={() => store.settings.oauthToken.enableSync('azure-ad')}
            >
              <Microsoft className='mr-2' />
              Microsoft Outlook
            </MenuItem>
          </MenuList>
        </Menu>
      </div>

      <Table
        data={data}
        rowHeight={28}
        columns={columns}
        contentHeight={'calc(100vh - 40px)'}
      />
    </div>
  );
});
