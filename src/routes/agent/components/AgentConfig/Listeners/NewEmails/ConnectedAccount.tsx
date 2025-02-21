import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { OauthToken } from '@store/Settings/OauthTokenStore.store.ts';
import { NewEmailsUsecase } from '@domain/usecases/agents/listeners/new-emails.usecase.ts';

import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip.tsx';
import { useDisclosure } from '@ui/utils/hooks/useDisclosure.ts';
import { ConfirmDialog } from '@ui/overlay/AlertDialog/ConfirmDialog';

export const ConnectedAccount = observer(
  ({ token, usecase }: { token: OauthToken; usecase: NewEmailsUsecase }) => {
    const store = useStore();
    const { onOpen, onClose, open } = useDisclosure({ id: 'delete-field' });
    const navigate = useNavigate();

    return (
      <div className='flex justify-between items-center group'>
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
          <IconButton
            size='xxs'
            variant='ghost'
            onClick={onOpen}
            colorScheme='gray'
            aria-label='Remove token'
            icon={<Icon name='x-circle' />}
            className='opacity-0 group-hover:opacity-100'
          />
          {token.needsManualRefresh && (
            <Tooltip
              className='max-w-[320px]'
              label={`Your conversations and meetings are no longer syncing because access to your ${
                token.provider === 'azure-ad'
                  ? 'Microsoft Outlook'
                  : 'Google Workspace'
              } account has expired`}
            >
              <IconButton
                size='xxs'
                variant='ghost'
                colorScheme='warning'
                aria-label='Refresh token'
                icon={<Icon name='refresh-ccw-02' />}
                onClick={() =>
                  store.settings.oauthToken.enableSync(
                    'PERSONAL',
                    token.provider,
                  )
                }
              />
            </Tooltip>
          )}
        </div>
        <ConfirmDialog
          isOpen={open}
          onClose={onClose}
          title='Remove this account?'
          cancelButtonLabel='Go to Settings'
          onCancel={() => navigate('/settings')}
          confirmButtonLabel='Remove from agent'
          onConfirm={() => {
            usecase.removeLink(token.email);

            return usecase.execute();
          }}
          body={
            <>
              <p className='text-sm'>
                Removing this account will only stop it from importing emails
                with this agent.{' '}
              </p>
              <p className='text-sm'>
                You can fully revoke its access in your workspace settings.{' '}
              </p>
            </>
          }
        />
      </div>
    );
  },
);
