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
            'flex py-3 pl-0 pr-3 min-h-[75px] max-w-[600px] min-w-[600px]',
            `group`,
            email.value.direction === 'outbound' ? 'self-end' : 'self-start',
          )}
        >
          {email.value.direction === 'inbound' && (
            <EmailParticipants
              from={email.value.from}
              to={email.value.to ?? []}
              cc={email.value.cc ?? []}
              fromName={email.fromName}
              bcc={email.value.bcc ?? []}
              className={cn(
                _useCase?.expand?.has(email.id) &&
                  email.value.body.length > 0 &&
                  'self-end',
                'mr-2',
              )}
            />
          )}
          <div
            className={cn(
              'flex flex-col rounded-xl p-3 ml-0 min-w-[600px]',
              `group`,
              _useCase?.expand?.has(email.id) &&
                email.value.direction === 'inbound' &&
                email.value.body.length > 0 &&
                'rounded-es-sm',
              email.value.direction === 'outbound' && 'bg-grayWarm-100 ',
              email.value.direction === 'inbound' && 'bg-grayModern-100 ',
            )}
          >
            <div className='flex justify-between items-center w-full'>
              <p className='font-medium text-sm mr-1 min-w-fit'>
                {email.fromName || 'Nic John'}:
              </p>
              {!_useCase?.expand?.has(email.id) && (
                <MarkdownRenderer
                  content={email.body}
                  className='line-clamp-1 w-[455px]'
                />
              )}
              <div className='flex items-center min-w-[80px] justify-end min-h-[22px]'>
                <p className='text-grayModern-500 text-sm group-hover:hidden'>
                  {timeAgo(email.value.receivedAt)}
                </p>
                <IconButton
                  size='xxs'
                  variant='ghost'
                  aria-label='Expand'
                  className={cn('hidden group-hover:flex ')}
                  onClick={() => {
                    _useCase?.toggleExpand(email.id);
                    _useCase?.toggleExpandAll();
                  }}
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
            {_useCase?.expand?.has(email.id) && (
              <MarkdownRenderer className='w-full' content={email.body} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
});
