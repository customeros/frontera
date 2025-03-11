import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { EditTaskDetailsUsecase } from '@domain/usecases/tasks/edit-task.usecase';

import { useStore } from '@shared/hooks/useStore';
import { TaskStatus } from '@shared/components/TaskStatus';

export const TaskStatusCell = observer(({ taskId }: { taskId: string }) => {
  const store = useStore();
  const task = store.tasks.getById(taskId);

  if (!task) return null;

  const usecase = useMemo(() => new EditTaskDetailsUsecase(task), [task]);

  return <TaskStatus usecase={usecase} value={task.value.status} />;
});
