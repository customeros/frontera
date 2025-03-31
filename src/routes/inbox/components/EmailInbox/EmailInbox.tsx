import { useSearchParams } from 'react-router-dom';
import { useRef, useMemo, useEffect, useCallback } from 'react';

import { observer } from 'mobx-react-lite';
import { Thread } from '@store/Inbox/Threads/Thread.dto';
import { EmailProfileUsecase } from '@domain/usecases/inbox/email-profile.usecase';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { Button } from '@ui/form/Button/Button';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

import { timeAgo } from '../../utils/timeAgo';

interface EmailInboxProps {
  excludeDone?: boolean;
}

export const EmailInbox = observer(
  ({ excludeDone = false }: EmailInboxProps) => {
    const store = useStore();
    const threads = store.threads.toArray();
    const [_searchParams, setSearchParams] = useSearchParams();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastEmailElementRef = useRef<HTMLDivElement | null>(null);

    const emailProfileUsecase = useMemo(
      () => new EmailProfileUsecase(store.threads),
      [],
    );

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
    }, [store.threads.isLoading, store.threads.hasNextPage]);

    useEffect(() => {
      emailProfileUsecase.init();
    }, [store.threads.toArray().length]);

    const renderThread = (thread: Thread, index: number) => {
      const isLast = index === threads.length - 10;
      const lastSender = thread.value.lastSender;
      const profile = emailProfileUsecase.getProfile(lastSender);

      return (
        <div
          key={thread.id}
          ref={isLast ? lastEmailRef : null}
          className='flex gap-2 p-2 cursor-pointer items-center group hover:bg-grayModern-100 hover:rounded-md'
          onClick={() => {
            setSearchParams((prev) => {
              prev.delete('newEmail');
              prev.set('id', thread.id);

              return prev;
            });
          }}
        >
          <div>
            <Avatar
              size='sm'
              textSize='sm'
              variant='outlineCircle'
              name={profile?.name ?? ''}
              icon={<Icon name='user-03' />}
              src={profile?.profilePhotoUrl}
            />
          </div>
          <div className='w-full '>
            <div className='flex items-center justify-between '>
              <p
                className={cn(
                  'text-sm font-medium line-clamp-1',
                  thread.value.isDone
                    ? 'text-grayModern-500'
                    : 'text-grayModern-700',
                )}
              >
                {thread.value.subject}
              </p>
              {thread.value.isDone ? (
                <IconButton
                  size='xxs'
                  variant='ghost'
                  aria-label='Done'
                  icon={<Icon className='size-3' name='check-circle' />}
                  className='text-xs text-grayModern-500 group-hover:hidden'
                />
              ) : (
                <>
                  <p className='text-xs text-grayModern-500 group-hover:hidden'>
                    {timeAgo(thread.value.lastMessageAt)}
                  </p>
                  <IconButton
                    size='xxs'
                    variant='ghost'
                    aria-label='Mark as done'
                    className='hidden group-hover:flex'
                    icon={<Icon name='circle' className='size-3' />}
                  />
                </>
              )}
            </div>
            <p
              className={cn(
                'text-sm line-clamp-2',
                thread.value.isDone
                  ? 'text-grayModern-500'
                  : 'text-grayModern-700',
                thread.value.summary === '' && 'text-grayModern-400',
              )}
            >
              {thread.value.summary || 'No email body :('}
            </p>
          </div>
        </div>
      );
    };

    return (
      <div className='flex flex-col mt-2 overflow-y-auto h-[calc(100vh-80px)] pb-20 relative'>
        {threads
          .filter((thread) => !excludeDone || !thread.value.isDone)
          .map((thread, index) => renderThread(thread, index))}
        <Button
          colorScheme='primary'
          leftIcon={<Icon name='edit-05' />}
          className='absolute bottom-0 right-0'
          onClick={() => {
            setSearchParams((prev) => {
              prev.delete('id');
              prev.set('newEmail', 'true');

              return prev;
            });
          }}
        >
          New Email
        </Button>
      </div>
    );
  },
);
