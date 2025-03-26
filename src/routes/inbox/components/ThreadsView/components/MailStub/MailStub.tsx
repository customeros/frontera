import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { EmailsInThreadUsecase } from '@domain/usecases/inbox/emails-in-thread.usecase';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

import { timeAgo } from '../../../../utils/timeAgo';
import { MarkdownRenderer, EmailParticipants } from './components';

export const MailStub = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();

  const threadId = searchParams.get('id');

  const _useCase = useMemo(() => {
    if (threadId) {
      // return new EmailsInThreadUsecase('thrd_h1aym1xqv1zrymnb');
      return new EmailsInThreadUsecase(threadId, store.emails);
    }
  }, [threadId]);

  useEffect(() => {
    if (threadId) {
      _useCase?.init();
    }
  }, [threadId]);

  const emailsInThread = store.emails.getEmailsByThreadId(threadId!);

  return (
    <div className='flex flex-col gap-2 justify-center items-center w-full '>
      {emailsInThread.map((email, idx) => (
        <div
          key={idx}
          className={cn(
            'flex border border-grayModern-200 rounded-md self-start p-3  ml-0 w-[calc(100%-32px)]',
            `group`,
            email.value.direction === 'outbound' &&
              'self-end w-[calc(100%-32px)]',
          )}
        >
          <div className='flex w-full items-center'>
            <div
              className={cn(
                'flex flex-col items-start justify-start self-start',
              )}
            >
              <EmailParticipants
                from={email.value.from}
                to={email.value.to ?? []}
                cc={email.value.cc ?? []}
                fromName={email.fromName}
                bcc={email.value.bcc ?? []}
              />
            </div>

            <div
              className={cn(
                'flex flex-col items-start justify-center ',
                _useCase?.expand?.has(email.id) &&
                  email.body.length > 0 &&
                  'mt-[3px]',
              )}
            >
              <div
                className={cn(
                  'flex items-start',
                  _useCase?.expand?.has(email.id) && '',
                )}
              >
                <p className='font-medium text-sm mr-1 min-w-fit '>
                  {email.fromName || 'Nic John'}:
                </p>
                {!_useCase?.expand?.has(email.id) && (
                  <MarkdownRenderer
                    content={email.body}
                    className={cn(
                      !_useCase?.expand?.has(email.id) && 'line-clamp-1',
                      'w-[455px]',
                    )}
                  />
                )}
              </div>
              {_useCase?.expand?.has(email.id) && (
                <MarkdownRenderer
                  content={email.body}
                  className={cn(
                    !_useCase?.expand?.has(email.id) && 'line-clamp-1',
                    'w-[555px]',
                  )}
                />
              )}
            </div>
          </div>
          <div className='flex flex-col text-center items-end w-[90px] self-start pt-0.5'>
            <p className='text-grayModern-500 text-sm group-hover:hidden group-hover:visible '>
              {timeAgo(email.value.receivedAt)}
            </p>
            <IconButton
              size='xxs'
              variant='ghost'
              aria-label='Expand'
              className={cn('hidden group-hover:flex')}
              onClick={() => _useCase?.toggleExpand(email.id)}
              icon={
                <Icon
                  className='size-4'
                  name={
                    _useCase?.expand?.has(email.id)
                      ? 'chevron-collapse'
                      : 'chevron-expand'
                  }
                />
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
});
