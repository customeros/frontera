import { TaskStatus as TaskStatusEnum } from '@graphql/types';
import { Tag, TagLabel, TagProps } from '@ui/presentation/Tag';

const statusColorSchemes: Record<TaskStatusEnum, TagProps['colorScheme']> = {
  [TaskStatusEnum.Todo]: 'blueLight',
  [TaskStatusEnum.InProgress]: 'indigo',
  [TaskStatusEnum.Done]: 'grayWarm',
};

const statusLabels = {
  [TaskStatusEnum.Todo]: 'Todo',
  [TaskStatusEnum.InProgress]: 'In Progress',
  [TaskStatusEnum.Done]: 'Done',
};

export const TaskStatus = ({ value }: { value: TaskStatusEnum }) => {
  return (
    <Tag size='md' variant='subtle' colorScheme={statusColorSchemes[value]}>
      <TagLabel>{statusLabels[value]}</TagLabel>
    </Tag>
  );
};
