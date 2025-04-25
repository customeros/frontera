import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon/Icon';
import { FeaturedIcon } from '@ui/media/Icon';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import SvgHalfCirclePattern from '@shared/assets/HalfCirclePattern';

export const EmptyState = observer(() => {
  const store = useStore();

  return (
    <>
      <div className='flex flex-col h-full w-full max-w-[448px]'>
        <div className='flex relative'>
          <FeaturedIcon
            size='lg'
            colorScheme='grayModern'
            className='absolute top-[26%] justify-self-center right-0 left-0'
          >
            <Icon name='calendar' />
          </FeaturedIcon>
          <SvgHalfCirclePattern />
        </div>
        <div className='flex flex-col text-center items-center translate-y-[-212px]'>
          <p className='text-grayModern-700 text-md font-semibold mb-1'>
            No calendar connected yet
          </p>
          <div className='text-sm my-1 max-w-[360px] text-center'>
            <>
              <p>
                Connect your calendar and set available time slots for your
                team’s{' '}
                <span className='cursor-pointer underline'>
                  meeting schedule
                </span>{' '}
              </p>
            </>
          </div>
          <Button
            colorScheme='primary'
            onClick={() => {
              store.settings.oauthToken.enableCalendarSync();
            }}
          >
            Connect Calendar
          </Button>
        </div>
      </div>
    </>
  );
});
