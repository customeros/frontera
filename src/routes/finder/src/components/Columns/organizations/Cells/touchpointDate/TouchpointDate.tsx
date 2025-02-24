import { DateTimeUtils } from '@utils/date';

export const LastTouchpointDateCell = ({
  lastTouchPointAt,
}: {
  lastTouchPointAt: string;
}) => {
  return (
    <span
      className='text-grayModern-700'
      data-test='organization-last-touchpoint-date-in-all-orgs-table'
    >
      {DateTimeUtils.timeAgo(lastTouchPointAt, {
        addSuffix: true,
      })}
    </span>
  );
};
