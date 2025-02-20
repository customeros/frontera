import { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { OauthToken } from '@store/Settings/OauthTokenStore.store.ts';

import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { useStore } from '@shared/hooks/useStore';
import { Button } from '@ui/form/Button/Button.tsx';
import { Google } from '@ui/media/logos/Google.tsx';
import { AgentListenerEvent } from '@graphql/types';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip.tsx';
import { Microsoft } from '@ui/media/icons/Microsoft.tsx';
import { LinkBroken01 } from '@ui/media/icons/LinkBroken01.tsx';
import { RefreshCcw01 } from '@ui/media/icons/RefreshCcw01.tsx';
import logoCustomerOs from '@shared/assets/customer-os-small.png';
import {
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
} from '@ui/overlay/Menu/Menu.tsx';

export const NewEmails = observer(() => {
  const store = useStore();
  const { id } = useParams<{ id: string }>();

  const tokens: OauthToken[] =
    store.settings.oauthToken.tokens?.filter(
      (token) => token.type === 'PERSONAL',
    ) ?? [];

  // useEffect(() => {
  //   usecase.init(id!);
  //
  //   return () => {
  //     usecase.reset();
  //   };
  // }, [id]);

  const agent = store.agents.getById(id ?? '');

  console.log('🏷️ ----- tokens: ', tokens);

  if (!agent) return null;

  if (tokens.length) {
    return (
      <div>
        <h2 className='text-sm font-medium mb-1'>
          {agent.getListenerName(AgentListenerEvent.NewEmail)}
        </h2>
        <p className='text-sm mb-4'>
          Add any workspace accounts or outbound mailboxes that you want this
          agent to monitor
        </p>

        <ConnectAccount>
          <Button size='sm' className='w-full' colorScheme='primary'>
            Connect accounts
          </Button>
        </ConnectAccount>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-1'>
        <h2 className='text-sm font-medium'>
          {agent.getListenerName(AgentListenerEvent.NewEmail) ?? 'New Emails'}
        </h2>
        <ConnectAccount>
          <Button
            size='xxs'
            variant='ghost'
            colorScheme='primary'
            leftIcon={<Icon name='plus' />}
          >
            Connect accounts
          </Button>
        </ConnectAccount>
      </div>

      <p className='text-sm mb-4'>
        Add any workspace accounts or outbound mailboxes that you want this
        agent to monitor
      </p>
      {/*{usecase.listenerErrors && (*/}
      {/*  <div className='bg-error-50 text-error-700 px-2 py-1 rounded-[4px] mb-4'>*/}
      {/*    <Icon stroke='none' className='mr-2' name='dot-single' />*/}
      {/*    <span className='text-sm'>{usecase.listenerErrors}</span>*/}
      {/*  </div>*/}
      {/*)}*/}

      {tokens.map((token, idx) => {
        return (
          <div
            key={`${token.email}_${idx}`}
            className='flex justify-between items-center group'
          >
            <div className='flex gap-2'>
              <Avatar
                src={''}
                size='xs'
                textSize='sm'
                name={token.email}
                variant={'outlineCircle'}
              />
              <p className='text-sm'>{token.email}</p>
            </div>
            <div className='flex items-center'>
              <Button
                size='xxs'
                variant='ghost'
                colorScheme='gray'
                leftIcon={<LinkBroken01 />}
                className='opacity-0 group-hover:opacity-100'
                onClick={() =>
                  store.settings.oauthToken.disableSync(
                    token.email,
                    token.provider,
                  )
                }
              >
                Unlink
              </Button>
              {token.needsManualRefresh && (
                <Tooltip
                  className='max-w-[320px]'
                  label={`Your conversations and meetings are no longer syncing because access to your ${
                    token.provider === 'azure-ad'
                      ? 'Microsoft Outlook'
                      : 'Google Workspace'
                  } account has expired`}
                >
                  <Button
                    size='xxs'
                    variant='ghost'
                    colorScheme='warning'
                    leftIcon={<RefreshCcw01 className='text-warning-500' />}
                    onClick={() =>
                      store.settings.oauthToken.enableSync(
                        'PERSONAL',
                        token.provider,
                      )
                    }
                  >
                    Re-allow
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

const ConnectAccount = observer(({ children }: { children: ReactNode }) => {
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
});
