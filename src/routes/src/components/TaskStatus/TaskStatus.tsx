import { EditTaskDetailsUsecase } from '@domain/usecases/tasks/edit-task.usecase';

import { Icon, IconName } from '@ui/media/Icon';
import { TaskStatus as TaskStatusEnum } from '@graphql/types';
import { Tag, TagLabel, TagProps, TagLeftIcon } from '@ui/presentation/Tag';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
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

export const TaskStatus = ({
  value,
  usecase,
}: {
  value: TaskStatusEnum;
  usecase: EditTaskDetailsUsecase;
}) => {
  const handleStatusChange = (status: TaskStatusEnum) => {
    usecase.setProperty('status', status);
    usecase.execute();
  };

  return (
    <Menu>
      <MenuButton asChild className='cursor-pointer'>
        <Tag size='md' variant='subtle' colorScheme={statusColorSchemes[value]}>
          <TagLeftIcon>
            <Icon className='size-4' name={statusIcons[value] as IconName} />
          </TagLeftIcon>
          <TagLabel>{statusLabels[value]}</TagLabel>
        </Tag>
      </MenuButton>

      <MenuList align='center'>
        <MenuItem
          className='group/todo'
          onClick={() => handleStatusChange(TaskStatusEnum.Todo)}
        >
          <div className='flex items-center gap-2'>
            <Icon
              name='circle'
              className='size-4 group-hover/todo:text-grayModern-700 text-grayModern-500'
            />
            <span>Todo</span>
          </div>
        </MenuItem>
        <MenuItem
          className='group/in-progress'
          onClick={() => handleStatusChange(TaskStatusEnum.InProgress)}
        >
          <div className='flex items-center gap-2 '>
            <Icon
              name='hourglass-02'
              className='size-4 group-hover/in-progress:text-grayModern-700 text-grayModern-500'
            />
            <span>In progress</span>
          </div>
        </MenuItem>
        <MenuItem
          className='group/done'
          onClick={() => handleStatusChange(TaskStatusEnum.Done)}
        >
          <div className='flex items-center gap-2'>
            <Icon
              name='check'
              className='size-4 group-hover/done:text-grayModern-700 text-grayModern-500'
            />
            <span>Done</span>
          </div>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
