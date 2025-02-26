import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { MailboxProvider } from '@shared/types/__generated__/graphql.types';

interface MailboxCellProps {
  mailbox: string;
}

export const MailboxCell = observer(({ mailbox }: MailboxCellProps) => {
  const store = useStore();
  const mailboxStore = store.mailboxes.value.get(mailbox);

  return (
    <div className='flex gap-1 items-center group/mailbox'>
      {/* <Avatar
        size='xs'
        textSize='xxs'
        variant='circle'
        name={user?.name ?? ''}
        src={user?.value?.profilePhotoUrl ?? ''}
        className={'min-w-5 mr-2 border border-grayModern-200'}
        icon={<User01 className='text-grayModern-500 size-3' />}
<<<<<<< HEAD
      />
>>>>>>> 381a3e8 (wip)
=======
      /> */}
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
        <IconButton
          size='xxs'
          variant='ghost'
          colorScheme='grayModern'
          aria-label='unlink mailbox'
          icon={<Icon name='link-broken-02' />}
          className='opacity-0 group-hover/mailbox:opacity-100'
          onClick={() =>
            store.settings.oauthToken.disableSync(
              mailboxStore?.value?.mailbox || '',
              mailboxStore?.value?.provider ?? '',
            )
          }
        />
      </div>
    </div>
  );
});
