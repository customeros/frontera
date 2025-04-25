import { useMemo, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { differenceInMinutes } from 'date-fns';
import { registry } from '@domain/stores/registry';
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
  const calendar = registry.get('settings');
  const calendarConnectionStatus = calendar.getOrFetch('');

  const usecase = useMemo(() => new CalendarUserUsecase(calendar), []);

  useEffect(() => {
    if (calendarConnectionStatus?.email) {
      usecase.init(calendarConnectionStatus?.email);
    }
  }, [calendarConnectionStatus?.email]);

  const timezones = usecase.timezones;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (
      differenceInMinutes(
        new Date().getUTCDate(),
        new Date(usecase.calendarAvailability?.createdAt).getUTCDate(),
      ) < 1 &&
      usecase.calendarAvailability?.timezone === 'Etc/UTC'
    ) {
      usecase.updateCalendarAvailability({
        input: {
          timezone: timeZone,
        },
      });
      usecase.execute();
    }
  }, [usecase.calendarAvailability?.createdAt]);

  if (!calendarConnectionStatus?.connected) {
    return (
      <div className='flex flex-col h-full w-full max-w-[448px] border-r border-grayModern-200'>
        <EmptyState />
      </div>
    );
  }

  return (
    <>
      <div className='px-6 pb-4 pt-2 max-w-[500px] border-r border-grayModern-200 h-full'>
        <div className='flex flex-col'>
          <p className='text-grayModern-700 font-semibold'>Calendar</p>
          <p>
            Set your connected calendar and available time slots for your team’s
            <span className='cursor-pointer underline'> meeting schedule</span>
          </p>
          <div className='flex items-center justify-between mt-4'>
            <div className='flex gap-2 items-center'>
              <Logo name='calendar-google' className='place-self-end mb-0.5' />
              <p>{calendarConnectionStatus?.email}</p>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size='xs'
                    leftIcon={<Icon name='globe-02' />}
                    rightIcon={<Icon name='chevron-down' />}
                  >
                    {usecase.calendarAvailability?.timezone ||
                      'Your current timezone'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Combobox
                    options={timezones?.map((timezone) => ({
                      label: timezone,
                      value: timezone,
                    }))}
                    onChange={(value) => {
                      usecase.updateCalendarAvailability({
                        input: {
                          timezone: value.value,
                        },
                      });
                      usecase.execute();
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
              {calendarConnectionStatus?.email}
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
