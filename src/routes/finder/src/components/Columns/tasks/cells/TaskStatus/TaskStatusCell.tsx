import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { IconName } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { TaskStatus as TaskStatusEnum } from '@graphql/types';
import { Tag, TagLabel, TagProps, TagLeftIcon } from '@ui/presentation/Tag';

const statusColorSchemes: Record<TaskStatusEnum, TagProps['colorScheme']> = {
  [TaskStatusEnum.Todo]: 'blueLight',
  [TaskStatusEnum.InProgress]: 'indigo',
  [TaskStatusEnum.Done]: 'grayWarm',
};

const statusLabels = {
  [TaskStatusEnum.Todo]: 'Todo',
  [TaskStatusEnum.InProgress]: 'In progress',
  [TaskStatusEnum.Done]: 'Done',
};

const statusIcons = {
  [TaskStatusEnum.Todo]: 'circle',
  [TaskStatusEnum.InProgress]: 'hourglass-02',
  [TaskStatusEnum.Done]: 'check',
};

export const TaskStatusCell = observer(({ taskId }: { taskId: string }) => {
  const store = useStore();
  const task = store.tasks.getById(taskId);

  if (!task) return null;

  return (
    <Tag
      size='md'
      variant='subtle'
      className='cursor-pointer'
      colorScheme={statusColorSchemes[task.value.status]}
      onClick={() => {
        store.ui.commandMenu.setType('ChangeTaskStatus');
        store.ui.commandMenu.setOpen(true);
      }}
    >
      <TagLeftIcon>
        <Icon
          className='size-4'
          name={statusIcons[task.value.status] as IconName}
        />
      </TagLeftIcon>
      <TagLabel>{statusLabels[task.value.status]}</TagLabel>
    </Tag>
  );
});
