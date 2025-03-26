import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Switch } from '@ui/form/Switch';
import { Button } from '@ui/form/Button/Button';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

import { EmailInbox } from './components/EmailInbox';
import { ThreadsView } from './components/ThreadsView';

export const InboxPage = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();

  const threadId = searchParams.get('id');

  const thread = store.emails.getEmailsByThreadId(threadId ?? '')?.[0];

  return (
    <div className='flex h-full'>
      <div className='border-r border-r-grayModern-200 h-full flex-1 min-w-[400px] max-w-[500px]'>
        <div className='border-b border-b-grayModern-200 px-3 py-[10px] flex justify-between items-center'>
          <p className='text-md font-medium'>Inbox</p>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-grayModern-500'>Todo Only</span>
            <Switch />
          </div>
        </div>
        <div className='flex flex-col overflow-y-auto h-full'>
          {/* <div className='flex justify-between items-center p-2 border-b border-b-grayModern-200 bg-grayModern-50 '>
            <p className='text-sm font-medium'>Scheduled & drafts</p>
            <IconButton
              size='xs'
              variant='ghost'
              icon={<Icon name='chevron-right' />}
              aria-label='go to scheduled & drafts'
            />
          </div> */}
          <div className='p-2'>
            <EmailInbox />
          </div>
        </div>
      </div>
      <div className='border-r border-r-grayModern-200 h-full flex-2'>
        <div className='border-b border-b-grayModern-200 px-3 py-[7px] flex justify-between items-center'>
          <p className='text-md font-medium'>
            {thread?.value?.subject || 'No subject yet...'}
          </p>
          <div className='flex items-center gap-2'>
            <IconButton
              size='xs'
              variant='ghost'
              aria-label='Search'
              icon={<Icon name='search-sm' />}
            />
            <Button
              size='xs'
              leftIcon={<Icon name='layout-right-drawer-panel' />}
            >
              Summary
            </Button>
          </div>
        </div>

        <ThreadsView />
      </div>
    </div>
  );
});
