import IMask from 'imask';

import { Switch } from '@ui/form/Switch';
import { MaskedInput } from '@ui/form/Input/MaskedInput';

interface DaySlotProps {
  dayName: string;
  endHour: string;
  startHour: string;
}

export const DaySlot = ({ dayName, startHour, endHour }: DaySlotProps) => {
  return (
    <div className='flex items-center justify-between mb-2'>
      <div className='flex items-center gap-3'>
        <Switch />
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
        />
        <span>-</span>
        <MaskedInput
          size='sm'
          mask='HH:MM'
          className='w-14'
          variant='outline'
          placeholder='00:00'
          value={endHour ?? ''}
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
        />
      </div>
    </div>
  );
};
