import { useMemo, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { registry } from '@domain/stores/registry';
import { CalendarAvailability } from '@domain/entities/calendarAvailability.entity';
import { CalendarUserUsecase } from '@domain/usecases/settings/calendar/calendar-user.usecase';

import { Logo } from '@ui/media/Logo';
import { Icon } from '@ui/media/Icon';
import { Combobox } from '@ui/form/Combobox';
import { Button } from '@ui/form/Button/Button';
import { Divider } from '@ui/presentation/Divider';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';

import { DaySlot } from './components/DaySlot';
import { EmptyState } from './components/EmptyState';

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
  const calendarConnectionStatus = registry.get('settings').getOrFetch('');

  const usecase = useMemo(() => new CalendarUserUsecase(), []);

  useEffect(() => {
    if (calendarConnectionStatus?.email) {
      usecase.init(calendarConnectionStatus?.email);
    }
  }, [calendarConnectionStatus?.email]);

  if (!calendarConnectionStatus?.connected) {
    return (
      <div className='flex flex-col h-full w-full max-w-[448px] border-r border-grayModern-200'>
        <EmptyState />
      </div>
    );
  }

  return (
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
          <div className='flex items-center gap-1'>
            <Icon stroke='none' name='dot-live-success' />
            <p className='text-sm text-greenModern-500'>Connected</p>
          </div>
        </div>
        <Divider className='my-4' />
        <div className='mb-3'>
          <div className='flex items-center justify-between'>
            <p className='font-semibold'>Availability</p>
            <Popover>
              <PopoverTrigger>
                <Button
                  size='xs'
                  leftIcon={<Icon name='globe-02' />}
                  rightIcon={<Icon name='chevron-down' />}
                >
                  sa-mi bag pula
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Combobox
                  options={[{ label: 'Availability', value: 'availability' }]}
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
            endHour={
              usecase.calendarAvailability?.[day as keyof CalendarAvailability]
                ?.endHour
            }
            startHour={
              usecase.calendarAvailability?.[day as keyof CalendarAvailability]
                ?.startHour
            }
          />
        ))}
      </div>
    </div>
  );
});
