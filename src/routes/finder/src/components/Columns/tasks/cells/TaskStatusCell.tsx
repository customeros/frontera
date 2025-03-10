import { observer } from 'mobx-react-lite';

import { TaskStatus } from '@shared/components/TaskStatus';
import { TaskStatus as TaskStatusEnum } from '@graphql/types';

export const TaskStatusCell = observer(
  ({ value }: { value: TaskStatusEnum }) => {
    return <TaskStatus value={value} />;
  },
);
