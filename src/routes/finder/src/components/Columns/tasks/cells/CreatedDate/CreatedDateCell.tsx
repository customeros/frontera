import { formatDate } from 'date-fns';

interface CreatedDateCellProps {
  date: string;
}

export const CreatedDateCell = ({ date }: CreatedDateCellProps) => {
  return <div>{formatDate(date, 'dd MMM yyyy')}</div>;
};
