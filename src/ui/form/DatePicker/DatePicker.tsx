import { forwardRef } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';

import { twMerge } from 'tailwind-merge';

import { Icon } from '@ui/media/Icon';

export const DatePicker = forwardRef(
  ({ value, onChange, className, ...props }: CalendarProps, ref) => {
    const handleDateInputChange = (
      value: CalendarProps['value'],
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
      if (!value) return onChange?.(null, event);

      const normalizedDate = new Date(value as string | number | Date);

      onChange?.(normalizedDate, event);
    };

    return (
      <Calendar
        ref={ref}
        value={value}
        defaultValue={value}
        className={twMerge(className)}
        onChange={handleDateInputChange}
        prevLabel={<Icon name='chevron-left' />}
        nextLabel={<Icon name='chevron-right' />}
        formatMonth={(locale, date) =>
          date.toLocaleDateString(locale, { month: 'short' })
        }
        {...props}
      />
    );
  },
);
