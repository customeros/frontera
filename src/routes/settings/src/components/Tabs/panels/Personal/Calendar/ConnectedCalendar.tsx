import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { calendarConnectionStore } from '@domain/stores/settings.store';
import { CalendarAvailability } from '@domain/entities/calendarAvailability.entity';
import { CalendarUserUsecase } from '@domain/usecases/settings/calendar/calendar-user.usecase';

import { Logo } from '@ui/media/Logo';
import { Icon } from '@ui/media/Icon';
import { Combobox } from '@ui/form/Combobox';
import { Button } from '@ui/form/Button/Button';
import { Divider } from '@ui/presentation/Divider';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';
import { ConfirmDeleteDialog } from '@ui/overlay/AlertDialog/ConfirmDeleteDialog';

import { DaySlot, EmptyState } from './components';
const days = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const ConnectedCalendar = observer(() => {
  const navigate = useNavigate();
  const usecase = useMemo(
    () => new CalendarUserUsecase(calendarConnectionStore),
    [],
  );

  useEffect(() => {
    if (calendarConnectionStore?.email) {
      usecase.init(calendarConnectionStore?.email);
    }
  }, [calendarConnectionStore?.email]);

  const timezones = usecase.timezones;

  if (!calendarConnectionStore?.connected) {
    return (
      <div className='flex flex-col h-full w-full max-w-[448px] border-r border-grayModern-200'>
        <EmptyState />
      </div>
    );
  }

  return (
    <>
      <div className='px-6 pb-4 pt-2 max-w-[500px] border-r border-grayModern-200 h-full text-sm'>
        <div className='flex flex-col'>
          <p
            className='text-grayModern-700 font-semibold text-base
          '
          >
            Calendar
          </p>
          <p>
            Set your connected calendar and available time slots for your team’s
            <span
              className='cursor-pointer underline'
              onClick={() => navigate('/settings?tab=team-scheduling')}
            >
              {' '}
              meeting schedule
            </span>
          </p>
          <div className='flex items-center justify-between mt-4'>
            <div className='flex gap-2 items-center'>
              <Logo name='calendar-google' className='place-self-end mb-0.5' />
              <p>{calendarConnectionStore?.email}</p>
            </div>
            <Button
              size='xs'
              variant='ghost'
              leftIcon={<Icon stroke='none' name='dot-live-success' />}
              onClick={() => {
                usecase.toggleModal();
              }}
            >
              Connected
            </Button>
          </div>
          <Divider className='my-4' />
          <div className='mb-3'>
            <div className='flex items-center justify-between'>
              <p className='font-semibold'>Availability</p>
              <Popover
                open={usecase.timezoneIsOpen}
                onOpenChange={usecase.toggleTimezoneModal}
              >
                <PopoverTrigger asChild>
                  <Button
                    size='xs'
                    rightIcon={<Icon name='chevron-down' />}
                    className='min-w-[215px] justify-between'
                    onClick={() => {
                      usecase.toggleTimezoneModal();
                    }}
                  >
                    {usecase.calendarAvailability?.timezone ||
                      'Your current timezone'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[215px]'>
                  <Combobox
                    placeholder='Search a location...'
                    options={timezones?.map((timezone) => ({
                      label: timezone.label,
                      value: timezone.value,
                    }))}
                    onChange={(value) => {
                      usecase.updateCalendarAvailability({
                        input: {
                          timezone: value.value,
                        },
                      });
                      usecase.execute();
                      usecase.toggleTimezoneModal();
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p>Choose when you're available for others to book time with you</p>
          </div>
          {days.map((day) => (
            <DaySlot
              key={day}
              dayName={day}
              usecase={usecase}
              endHour={
                usecase.calendarAvailability?.[
                  day as keyof CalendarAvailability
                ]?.endHour
              }
              startHour={
                usecase.calendarAvailability?.[
                  day as keyof CalendarAvailability
                ]?.startHour
              }
            />
          ))}
        </div>
      </div>
      <ConfirmDeleteDialog
        isOpen={usecase.modalOpen}
        confirmButtonLabel='Disconnect'
        label='Disconnect your calendar?'
        onClose={() => {
          usecase.toggleModal();
        }}
        onConfirm={() => {
          usecase.deleteCalendarAvailability();
        }}
        description={
          <p>
            Disconnecting{' '}
            <span className='font-semibold'>
              {calendarConnectionStore?.email}
            </span>{' '}
            will revoke CustomerOS’s access to this calendar. Existing meetings
            won’t be affected, but any rescheduled ones will go to the next
            available user.
          </p>
        }
      />
    </>
  );
});
