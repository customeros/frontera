import { IMask } from 'react-imask';

import { observer } from 'mobx-react-lite';
import { MeetingSchedulerUsecase } from '@domain/usecases/settings/meeting-scheduler/meeting-scheduler.usecase';

import { Icon } from '@ui/media/Icon';
import { Switch } from '@ui/form/Switch';
import { MaskedInput } from '@ui/form/Input/MaskedInput';

interface AvailabilityLimitsProps {
  usecase: MeetingSchedulerUsecase;
}

export const AvailabilityLimits = observer(
  ({ usecase }: AvailabilityLimitsProps) => {
    return (
      <>
        <div className='flex items-center gap-2 w-full justify-between'>
          <div className='flex items-center gap-2'>
            <Icon name='settings-04' className='text-grayModern-500' />
            <p className='font-medium'>Availability limits</p>
          </div>

          <Switch
            checked={usecase.meetingConfig.bookOptionEnabled}
            onChange={(value) => {
              usecase.updateMeetingConfig({ bookOptionEnabled: value });
            }}
          />
        </div>
        {usecase.meetingConfig.bookOptionEnabled && (
          <>
            <label className='font-medium' htmlFor='buffer-between-meetings'>
              Buffer between meetings
            </label>
            <div className='flex items-center gap-2'>
              <MaskedInput
                size='sm'
                mask='num'
                maxLength={2}
                variant='outline'
                className='max-w-[34px]'
                id='buffer-between-meetings'
                value={String(
                  usecase.meetingConfig.bookOptionBufferBetweenMeetingsMins,
                )}
                blocks={{
                  num: {
                    mask: IMask.MaskedRange,
                    from: 0,
                    to: 99,
                  },
                }}
                onBlur={({ target }) => {
                  usecase.updateMeetingConfig({
                    bookOptionBufferBetweenMeetingsMins: target.value,
                  });
                }}
              />
              <span className='text-grayModern-500'>
                {usecase.meetingConfig.bookOptionBufferBetweenMeetingsMins ===
                '1'
                  ? 'minute'
                  : 'minutes'}
              </span>
            </div>
            <label className='font-medium' htmlFor='bookings-up-to'>
              Allow bookings up to...
            </label>
            <div className='flex items-center gap-2'>
              <MaskedInput
                size='sm'
                mask='num'
                maxLength={2}
                variant='outline'
                id='bookings-up-to'
                className='max-w-[34px]'
                value={String(usecase.meetingConfig.bookOptionDaysInAdvance)}
                onBlur={({ target }) => {
                  usecase.updateMeetingConfig({
                    bookOptionDaysInAdvance: target.value,
                  });
                }}
                blocks={{
                  num: {
                    mask: IMask.MaskedRange,
                    from: 0,
                    to: 99,
                  },
                }}
              />
              <span className='text-grayModern-500'>
                {usecase.meetingConfig.bookOptionDaysInAdvance === '1'
                  ? 'day in advance'
                  : 'days in advance'}
              </span>
            </div>
            <label className='font-medium' htmlFor='minimum-booking-notice'>
              Minimum booking notice
            </label>
            <div className='flex items-center gap-2'>
              <MaskedInput
                size='sm'
                mask='num'
                maxLength={2}
                variant='outline'
                className='max-w-[34px]'
                id='minimum-booking-notice'
                value={String(usecase.meetingConfig.bookOptionMinNoticeMins)}
                onBlur={({ target }) => {
                  usecase.updateMeetingConfig({
                    bookOptionMinNoticeMins: target.value,
                  });
                }}
                blocks={{
                  num: {
                    mask: IMask.MaskedRange,
                    from: 0,
                    to: 99,
                  },
                }}
              />
              <span className='text-grayModern-500'>
                {usecase.meetingConfig.bookOptionMinNoticeMins === '1'
                  ? 'minute'
                  : 'minutes'}
              </span>
            </div>
          </>
        )}
      </>
    );
  },
);
