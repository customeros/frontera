import { observer } from 'mobx-react-lite';
import { calendarConnectionStore } from '@domain/stores/settings.store';
import { MeetingSchedulerUsecase } from '@domain/usecases/settings/meeting-scheduler/meeting-scheduler.usecase';

import { Icon } from '@ui/media/Icon/Icon';
import { FeaturedIcon } from '@ui/media/Icon';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import SvgHalfCirclePattern from '@shared/assets/HalfCirclePattern';
export const EmptyState = observer(
  ({ usecase }: { usecase: MeetingSchedulerUsecase }) => {
    const store = useStore();
    const calendarConnectionStatus = calendarConnectionStore;

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
              Team scheduling
            </p>
            <div className='text-sm my-1 max-w-[360px] text-center'>
              <>
                <p>
                  A team schedule makes it easy to manage and share your team’s
                  availability, so others can book time with the{' '}
                  <span className='italic'>right </span>
                  {''} person.
                </p>
                {!calendarConnectionStatus.connected && (
                  <p className='mt-4'>
                    Start by connecting your calendar and set your availability
                    — or ask a teammate to connect theirs.
                  </p>
                )}
              </>
            </div>
            <Button
              className='mt-6'
              colorScheme='primary'
              onClick={() => {
                if (!calendarConnectionStatus.connected) {
                  store.settings.oauthToken.enableCalendarSync();
                } else {
                  usecase.createMeetingConfig();
                }
              }}
            >
              {!calendarConnectionStatus.connected
                ? 'Connect my calendar'
                : 'Get started'}
            </Button>
          </div>
        </div>
      </>
    );
  },
);
