import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { EmailsInThreadUsecase } from '@domain/usecases/inbox/emails-in-thread.usecase';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';

import { timeAgo } from '../../../../utils/timeAgo';
export const MailStub = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();

  const threadId = searchParams.get('email');

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
    <div className='flex flex-col gap-2 min-w-[90%] items-center'>
      {emailsInThread.map((email, idx) => (
        <div
          key={idx}
          className={cn(
            'flex border border-grayModern-200 rounded-md items-center w-[95%]  p-3 ml-10',
            `group`,
          )}
        >
          <div className='flex w-full'>
            <div className='flex flex-col'>
              <Tooltip
                className='flex flex-col'
                label={
                  <>
                    From: {email.value.from}
                    <br />
                    To: {email.value.to.join(', ')}
                    <br />
                    {email.value.cc && email.value.cc?.length > 0 && (
                      <>
                        CC: {email.value.cc}
                        <br />
                      </>
                    )}
                  </>
                }
              >
                <div>
                  <Avatar
                    src={''}
                    size='xs'
                    className='mr-2'
                    alt={email.fromName}
                    variant='outlineCircle'
                    icon={<Icon name='user-03' />}
                    name={email.fromName || 'Nic John'}
                  />
                </div>
              </Tooltip>
            </div>
            {/* <div className='flex flex-col items-center font-medium mr-1'>
              {email.fromName || 'Nic'}:
            </div> */}
            <div
              className={cn(
                'flex flex-col items-center line-clamp-1',
                _useCase?.expand === email.id && 'line-clamp-none',
              )}
            >
              <span className='font-medium mr-1'>
                {email.fromName || 'Nic John'}:
              </span>
              {email.body}
            </div>
          </div>
          <div className='flex flex-col text-center items-start w-[50px] self-start pt-0.5'>
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
                    _useCase?.expand === email.id
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
