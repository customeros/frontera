interface DueDateCellProps {
  dueDate: string;
}

export const DueDateCell = ({ dueDate }: DueDateCellProps) => {
  if (!dueDate) return <span className='text-grayModern-400'>No due date</span>;

  const dueDateObj = new Date(dueDate);
  const today = new Date();
  const diffTime = dueDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let dueDateText;

  if (diffDays > 0) {
    dueDateText = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    dueDateText = 'Today';
  } else {
    const daysAgo = Math.abs(diffDays);

    dueDateText = `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
  }

  return (
    <div className='flex items-center gap-1'>
      <span>{dueDateText}</span>
    </div>
  );
};
