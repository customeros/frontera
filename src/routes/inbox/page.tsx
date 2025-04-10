import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Switch } from '@ui/form/Switch';
import { Input } from '@ui/form/Input/Input';
import { Button } from '@ui/form/Button/Button';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

import { EmailInbox } from './components/EmailInbox';
import { ThreadsView } from './components/ThreadsView';

export const InboxPage = observer(() => {
  const store = useStore();
  const [filterActive, setFilterActive] = useState(false);
  const [searchParams] = useSearchParams();

  const threadId = searchParams.get('id');

  const thread = store.emails.getEmailsByThreadId(threadId ?? '')?.[0];

  return (
    <div className='flex h-full'>
      <div className='border-r border-r-grayModern-200 h-full flex-1 min-w-[400px] max-w-[500px]'>
        <div className='border-b border-b-grayModern-200 px-3 py-[10px] flex justify-between items-center'>
          <p className='text-md font-medium'>Inbox</p>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-grayModern-500'>Exclude done</span>
            <Switch checked={filterActive} onCheckedChange={setFilterActive} />
          </div>
        </div>
        <div className='flex flex-col overflow-y-auto h-full'>
          <div className='p-2'>
            <EmailInbox excludeDone={filterActive} />
          </div>
        </div>
      </div>

      <div className='border-r border-r-grayModern-200 h-full flex-2'>
        <div
          className={cn(
            'border-b border-b-grayModern-200 px-3  flex justify-between items-center',
            threadId ? 'py-[7px]' : 'py-[6px]',
          )}
        >
          {threadId ? (
            <p className='text-md font-medium'>
              {thread?.value?.subject || 'No subject yet...'}
            </p>
          ) : (
            <Input
              size='sm'
              variant='unstyled'
              defaultValue='No subject yet...'
            />
          )}
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
