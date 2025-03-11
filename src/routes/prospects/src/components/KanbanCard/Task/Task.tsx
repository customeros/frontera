import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';

interface TaskProps {
  taskId: string;
}

export const Task = observer(({ taskId }: TaskProps) => {
  const store = useStore();
  const task = store.tasks.getById(taskId);
  const value = task?.value.subject;

  return (
    <Tooltip side='top' align='start' label='Next steps'>
      <div className='flex gap-2 w-full items-start justify-start'>
        <Icon className='mt-0.5' name='clipboard-text' />
        <p className='text-sm'>{value}</p>
      </div>
    </Tooltip>
  );
});
