import { FC, PropsWithChildren } from 'react';

import { DateTimeUtils } from '@utils/date';

interface TimelineItemProps extends PropsWithChildren {
  date: string;
  showDate: boolean;
}

export const TimelineItem: FC<TimelineItemProps> = ({
  date,
  showDate,
  children,
}) => {
  return (
    <div className='px-6 pb-2 bg-white'>
      {showDate && (
        <span className='text-grayModern-500 text-xs font-medium mb-2 inline-block'>
          {DateTimeUtils.format(date, DateTimeUtils.dateWithAbreviatedMonth)}
        </span>
      )}
      {children}
    </div>
  );
};
