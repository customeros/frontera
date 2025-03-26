import { useState } from 'react';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar/Avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';

interface EmailParticipantsProps {
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  fromName: string;
}

export const EmailParticipants = observer(
  ({ fromName, from, to, cc, bcc }: EmailParticipantsProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Avatar
            src={''}
            size='xs'
            alt={fromName}
            className='mr-2 '
            variant='outlineCircle'
            name={fromName || 'Nic John'}
            icon={<Icon name='user-03' />}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          />
        </PopoverTrigger>
        <PopoverContent className='bg-grayModern-700 text-white'>
          <div>
            <p className='text-sm'>From: {from}</p>
            {to.map((email, index) => (
              <p
                key={index}
                className={cn(index === 0 ? 'ml-0' : 'ml-[24px]', 'text-sm')}
              >
                {index === 0 ? 'To: ' : ''}
                {email}
              </p>
            ))}
            {cc.length > 0 && (
              <p className='ml-[24px] text-sm'>CC: {cc.join(', ')}</p>
            )}
            {bcc.length > 0 && (
              <p className='ml-[24px] text-sm'>BCC: {bcc.join(', ')}</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
