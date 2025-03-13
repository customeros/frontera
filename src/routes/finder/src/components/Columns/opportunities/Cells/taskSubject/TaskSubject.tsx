import { observer } from 'mobx-react-lite';

import { useStore } from '@shared/hooks/useStore';

interface TaskSubjectProps {
  taskIds: string[];
}

export const TaskSubject = observer(({ taskIds }: TaskSubjectProps) => {
  const store = useStore();

  if (taskIds.length === 0) {
    return <span className='text-grayModern-400'>No tasks</span>;
  }

  const tasks = store.tasks.getById(taskIds[0]);

  return <div className='truncate'>{tasks?.value.subject}</div>;
});
