import { ReactNode } from 'react';

import { observer } from 'mobx-react-lite';

import { Google } from '@ui/media/logos/Google';
import { useStore } from '@shared/hooks/useStore';
import { Microsoft } from '@ui/media/icons/Microsoft';
import logoCustomerOs from '@shared/assets/customer-os-small.png';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

export const ConnectAccountMenu = observer(
  ({ children }: { children: ReactNode }) => {
    const store = useStore();

    return (
      <Menu>
        <MenuButton asChild>{children}</MenuButton>
        <MenuList align='center' className='w-[230px]'>
          <MenuItem
            className='text-sm'
            onClick={() =>
              store.settings.oauthToken.enableSync('PERSONAL', 'google')
            }
          >
            <Google />
            Google Workspace
          </MenuItem>
          <MenuItem
            className='text-sm'
            onClick={() =>
              store.settings.oauthToken.enableSync('PERSONAL', 'azure-ad')
            }
          >
            <Microsoft />
            Microsoft Outlook
          </MenuItem>
          <MenuItem
            className='text-sm'
            onClick={() =>
              store.settings.oauthToken.enableSync('PERSONAL', 'azure-ad')
            }
          >
            <img width={16} height={16} alt='CustomerOS' src={logoCustomerOs} />
            CustomerOS mailboxes
          </MenuItem>
        </MenuList>
      </Menu>
    );
  },
);
