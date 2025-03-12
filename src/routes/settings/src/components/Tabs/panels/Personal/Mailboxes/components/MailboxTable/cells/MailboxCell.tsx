import { useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { User01 } from '@ui/media/icons/User01';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { useDisclosure } from '@ui/utils/hooks/useDisclosure';
import { MailboxProvider } from '@shared/types/__generated__/graphql.types';
import { ConfirmDeleteDialog } from '@ui/overlay/AlertDialog/ConfirmDeleteDialog';
interface MailboxCellProps {
  mailbox: string;
}
export const MailboxCell = observer(({ mailbox }: MailboxCellProps) => {
  const store = useStore();
  const [userId, setUserId] = useState<string | null>(null);
  const { open, onOpen, onClose } = useDisclosure();
  const mailboxStore = store.mailboxes.value.get(mailbox);

  useEffect(() => {
    const getUser = async () => {
      const currentUserId = store.session.value.profile.id;

      if (currentUserId) {
        setUserId(currentUserId);
      }
    };

    getUser();
  }, [store.session.value.profile.id]);

  const userStore = store.users.getById(userId ?? '');

  return (
    <>
      <div className='flex gap-1 items-center group/mailbox'>
        <Avatar
          size='xs'
          textSize='xxs'
          variant='circle'
          name={userStore?.value?.name ?? ''}
          src={userStore?.value?.profilePhotoUrl ?? ''}
          className={'min-w-5 mr-2 border border-grayModern-200'}
          icon={<User01 className='text-grayModern-500 size-3' />}
        />

        <div className='flex items-center justify-center gap-1'>
          <span>{mailbox}</span>

          {mailboxStore?.value?.needsManualRefresh && (
            <Tooltip
              label={`Your conversations and meetings are no longer syncing because access to your ${
                mailboxStore?.value?.provider === MailboxProvider.Google
                  ? 'Google Workspace'
                  : 'Microsoft Outlook'
              } account has expired`}
            >
              <IconButton
                size='xxs'
                variant='ghost'
                className=' mt-1.5'
                colorScheme='grayModern'
                aria-label='Refresh mailbox'
                icon={<Icon name='refresh-cw-01' />}
                onClick={() =>
                  store.settings.oauthToken.enableSync(
                    mailboxStore?.value?.provider ?? '',
                  )
                }
              />
            </Tooltip>
          )}
          <Tooltip label='Unlink this account'>
            <div>
              <IconButton
                size='xxs'
                variant='ghost'
                onClick={() => onOpen()}
                colorScheme='grayModern'
                aria-label='unlink mailbox'
                icon={<Icon name='link-broken-02' />}
                className='opacity-0 group-hover/mailbox:opacity-100'
              />
            </div>
          </Tooltip>
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={open}
        onClose={onClose}
        confirmButtonLabel='Disconnect'
        label={`Disconnect this mailbox?`}
        description={`Disconnecting this mailbox will revoke its access to your workspace. This means that any part of the app that relies on it, including agent capabilities, will stop working.`}
        onConfirm={() => {
          store.settings.oauthToken.disableSync(
            mailboxStore?.value?.mailbox || '',
            mailboxStore?.value?.provider ?? '',
          );
          store.mailboxes.removeMailbox(mailbox);
        }}
      />
    </>
  );
});
