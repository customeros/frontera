import { useStore } from '@shared/hooks/useStore';

interface DueDateCellProps {
  dueDate: string;
}

export const DueDateCell = ({ dueDate }: DueDateCellProps) => {
  const store = useStore();

  if (!dueDate)
    return (
      <span
        className='text-grayModern-400 cursor-pointer'
        onClick={() => {
          store.ui.commandMenu.setType('SetDueDate');
          store.ui.commandMenu.setOpen(true);
        }}
      >
        No due date
      </span>
    );

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
      <span
        className='cursor-pointer'
        onClick={() => {
          store.ui.commandMenu.setType('SetDueDate');
          store.ui.commandMenu.setOpen(true);
        }}
      >
        {dueDateText}
      </span>
    </div>
  );
};
