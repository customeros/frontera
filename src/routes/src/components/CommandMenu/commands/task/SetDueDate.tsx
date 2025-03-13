import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { EditTaskUsecase } from '@domain/usecases/command-menu/task/edit-task.usecase';

import { Tag } from '@ui/presentation/Tag/Tag';
import { TagLabel } from '@ui/presentation/Tag';
import { DatePicker } from '@ui/form/DatePicker';
import { useStore } from '@shared/hooks/useStore';
import { Command } from '@ui/overlay/CommandMenu';
import { Divider } from '@ui/presentation/Divider/Divider';

export const SetDueDate = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const task = store.tasks.value.get(context.ids?.[0] as string);

  const label = `Task - ${task?.value.subject}`;

  if (!task) return;

  const usecase = useMemo(() => new EditTaskUsecase(task), [task]);

  const handleClose = () => {
    store.ui.commandMenu.setOpen(false);
    store.ui.commandMenu.setType('TaskCommands');
  };

  const handleChange = () => {
    usecase.execute();
    handleClose();
  };

  return (
    <Command>
      <div className='flex flex-col gap-2 justify-center items-center'>
        <div className='flex p-6 pb-2 justify-items-start w-full'>
          <Tag size='md' variant='subtle' colorScheme='grayModern'>
            <TagLabel className='overflow-hidden truncate max-w-[390px] text-ellipsis'>
              {label}
            </TagLabel>
          </Tag>
        </div>
        <Divider className='my-2' />
        <DatePicker
          value={task?.value.dueAt}
          onChange={(value) => {
            usecase.setProperty(
              'dueAt',
              value ? value.toString() : new Date().toString(),
            );
            handleChange();
          }}
        />
      </div>
    </Command>
  );
});
