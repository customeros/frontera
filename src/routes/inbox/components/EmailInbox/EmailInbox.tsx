import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { useStore } from '@shared/hooks/useStore';
export const EmailInbox = observer(() => {
  const store = useStore();
  const emails = store.emailsInbox.toArray();
  const users = store.users.toArray();
  const [_searchParams, setSearchParams] = useSearchParams();

  return (
    <div className='flex flex-col mt-2'>
      {emails.map((email) => {
        const user = users.find((user) => user.id === email.userId);

        const _file = store.files.download(user?.profilePhotoUrl ?? '');
        const imgSrc = store.files.values.get(user?.profilePhotoUrl ?? '');

        return (
          <React.Fragment key={email.id}>
            <div
              className='flex gap-2 p-2 cursor-pointer items-center hover:bg-grayModern-100  hover:rounded-md'
              onClick={() => {
                setSearchParams((prev) => {
                  prev.set('email', email.id);

                  return prev;
                });
              }}
            >
              <div>
                <Avatar
                  size='sm'
                  src={imgSrc}
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

const timeAgo = (date: string) => {
  const now = new Date();
  const lastMessageDate = new Date(date);
  const diffInMs = now.getTime() - lastMessageDate.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 60) {
    return `${diffInMins}min `;
  } else if (diffInHours < 24) {
    return `${diffInHours}hours`;
  } else {
    return `${diffInDays}days`;
  }
};
