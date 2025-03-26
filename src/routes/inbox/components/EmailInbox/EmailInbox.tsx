import { useSearchParams } from 'react-router-dom';
import React, { useRef, useEffect, useCallback } from 'react';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { useStore } from '@shared/hooks/useStore';

import { timeAgo } from '../../utils/timeAgo';

export const EmailInbox = observer(() => {
  const store = useStore();
  const emails = store.threads.toArray();
  const users = store.users.toArray();
  const [_searchParams, setSearchParams] = useSearchParams();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastEmailElementRef = useRef<HTMLDivElement | null>(null);

  const lastEmailRef = useCallback((node: HTMLDivElement | null) => {
    lastEmailElementRef.current = node;
  }, []);

  useEffect(() => {
    if (store.threads.isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && store.threads.hasNextPage) {
        store.threads.loadMoreThreads();
      }
    });

    if (lastEmailElementRef.current) {
      observerRef.current.observe(lastEmailElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [store.threads.isLoading, store.threads.hasNextPage, emails.length]);

  return (
    <div className='flex flex-col mt-2 overflow-y-auto pb-20'>
      {emails.map((email, index) => {
        const user = users.find((user) => user.id === email.userId);
        const isLast = index === emails.length - 10;
        // const _file = store.files.download(user?.profilePhotoUrl ?? '');
        // const imgSrc = store.files.values.get(user?.profilePhotoUrl ?? '');

        return (
          <React.Fragment key={email.id}>
            <div
              ref={isLast ? lastEmailRef : null}
              className='flex gap-2 p-2 cursor-pointer items-center hover:bg-grayModern-100 hover:rounded-md'
              onClick={() => {
                setSearchParams((prev) => {
                  prev.set('id', email.id);

                  return prev;
                });
              }}
            >
              <div>
                <Avatar
                  src={''}
                  size='sm'
                  textSize='sm'
                  variant='outlineCircle'
                  name={user?.name ?? ''}
                  icon={<Icon name='user-03' />}
                />
              </div>
              <div className='w-full'>
                <div className='flex items-center justify-between gap-2'>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      email.isDone
                        ? 'text-grayModern-500'
                        : 'text-grayModern-700',
                    )}
                  >
                    {email.subject}
                  </p>
                  <p className='text-xs text-grayModern-500'>
                    {timeAgo(email.value.lastMessageAt)}
                  </p>
                </div>
                <p
                  className={cn(
                    'text-sm line-clamp-2',
                    email.isDone
                      ? 'text-grayModern-500'
                      : 'text-grayModern-700',
                    email.summary === '' && 'text-grayModern-400',
                  )}
                >
                  {email.summary || 'No email body :('}
                </p>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
});
