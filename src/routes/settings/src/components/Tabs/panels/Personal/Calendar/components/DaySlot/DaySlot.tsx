import IMask from 'imask';
import { CalendarAvailability } from '@domain/entities/calendarAvailability.entity';
import { CalendarUserUsecase } from '@domain/usecases/settings/calendar/calendar-user.usecase';

import { Switch } from '@ui/form/Switch';
import { MaskedInput } from '@ui/form/Input/MaskedInput';

interface DaySlotProps {
  dayName: string;
  endHour: string;
  startHour: string;
  usecase: CalendarUserUsecase;
}

export const DaySlot = ({
  dayName,
  startHour,
  endHour,
  usecase,
}: DaySlotProps) => {
  return (
    <div className='flex items-center justify-between mb-2'>
      <div className='flex items-center gap-3'>
        <Switch
          checked={
            usecase.calendarAvailability?.[
              dayName as keyof CalendarAvailability
            ]?.enabled
          }
          onChange={(value) => {
            usecase.updateCalendarAvailability({
              input: {
                [dayName]: {
                  ...usecase.calendarAvailability?.[
                    dayName as keyof CalendarAvailability
                  ],
                  enabled: value,
                },
              },
            });
            usecase.execute();
          }}
        />
        <span className='first-letter:uppercase'>{dayName}</span>
      </div>
      <div className='flex items-center gap-2'>
        <MaskedInput
          size='sm'
          mask='HH:MM'
          className='w-14'
          variant='outline'
          placeholder='00:00'
          value={startHour ?? ''}
          onBlur={() => {
            usecase.execute();
          }}
          blocks={{
            HH: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 23,
              maxLength: 2,
            },
            MM: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 59,
              maxLength: 2,
            },
          }}
          onAccept={(v) => {
            usecase.updateCalendarAvailability({
              input: {
                [dayName]: {
                  ...usecase.calendarAvailability?.[
                    dayName as keyof CalendarAvailability
                  ],
                  startHour: v,
                },
              },
            });
          }}
        />
        <span>-</span>
        <MaskedInput
          size='sm'
          mask='HH:MM'
          className='w-14'
          variant='outline'
          placeholder='00:00'
          value={endHour ?? ''}
          onBlur={() => {
            usecase.execute();
          }}
          blocks={{
            HH: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 23,
              maxLength: 2,
            },
            MM: {
              mask: IMask.MaskedRange,
              from: 0,
              to: 59,
              maxLength: 2,
            },
          }}
          onAccept={(v) => {
            usecase.updateCalendarAvailability({
              input: {
                [dayName]: {
                  ...usecase.calendarAvailability?.[
                    dayName as keyof CalendarAvailability
                  ],
                  endHour: v,
                },
              },
            });
          }}
        />
      </div>
    </div>
  );
};
