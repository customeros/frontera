import { useState } from 'react';

import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { useStore } from '@shared/hooks/useStore';
import { Tag, TagLabel } from '@ui/presentation/Tag';
import { InfoDialog } from '@ui/overlay/AlertDialog/InfoDialog';
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard';

export const Team = observer(() => {
  const store = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [_, copyToClipboard] = useCopyToClipboard();

  const users = store.users.tenantUsers;
  const tenantEmail = users?.[0].value?.emails?.[0]?.email?.split('@')[1];

  const handleToast = () => {
    copyToClipboard(
      'https://app.customeros.ai',
      'App link copied—now go share the love...',
    );
  };

  return (
    <div className='px-6 pt-2 max-w-[500px] border-r-grayModern-200 border-r h-full'>
      <div className='flex items-center justify-between'>
        <h1 className='text-md font-semibold'>Team members</h1>
        <Tag
          variant='subtle'
          colorScheme='primary'
          className='cursor-pointer'
          onClick={() => setIsOpen(true)}
        >
          <TagLabel className='items-center flex gap-1'>
            <Icon name='infinity' className='text-primary-500' /> Unlimited
            seats
          </TagLabel>
        </Tag>
      </div>

      <p className='text-sm py-4'>
        To invite your team, just{' '}
        <span onClick={handleToast} className='underline cursor-pointer'>
          share the app
        </span>{' '}
        with anyone using a<span className='font-medium'> {tenantEmail}</span>{' '}
        email address.
      </p>

      <div className=''>
        <div className='flex items-center text-sm font-medium py-1'>
          <div className='flex-1'>Name</div>
          <div className='flex-1'>Email</div>
        </div>
        {users.map((u) => {
          return (
            <div key={u.id} className='flex items-center text-sm py-2'>
              <div className='flex flex-1 items-center gap-2'>
                <Avatar
                  size='xs'
                  name={u.name}
                  src={u.profilePhotoUrl}
                  variant='outlineCircle'
                />
                <div>{u.name}</div>
              </div>
              <div className='flex-1'>{u.value.emails?.[0]?.email}</div>
            </div>
          );
        })}
      </div>

      <InfoDialog
        isOpen={isOpen}
        confirmButtonLabel='Thank you'
        onClose={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
        label='Unlimited seats, unlimited collaboration'
        body={
          <div className='text-sm space-y-4'>
            <p>
              SaaS is a team sport, requiring cross-functional collaboration at
              every stage of the customer journey. Yet when it comes to the
              tools we use and the data we have access to, we're still working
              in silos.
            </p>

            <p>
              With CustomerOS, your workspace has <b>unlimited seats</b>, so
              teams can work together without barriers.
            </p>

            <p>
              To invite your team, just share the app with anyone using a{' '}
              {tenantEmail} email address.
            </p>
          </div>
        }
      />
    </div>
  );
});
