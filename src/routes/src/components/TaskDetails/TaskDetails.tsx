import { useMemo } from 'react';

import { action } from 'mobx';
import { Tracer } from '@infra/tracer';
import { UTCDate } from '@date-fns/utc';
import { observer } from 'mobx-react-lite';
import { Task } from '@store/Tasks/Task.dto';

import { Icon } from '@ui/media/Icon';
import { Input } from '@ui/form/Input';
import { Combobox } from '@ui/form/Combobox';
import { SelectOption } from '@ui/utils/types';
import { DatePicker } from '@ui/form/DatePicker';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { TaskStatus } from '@shared/components/TaskStatus';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@ui/overlay/Popover';

class EditTaskDetailsUsecase {
  constructor(private readonly task: Task) {}

  @action
  setProperty(property: keyof Task['value'], value: string | number) {
    const span = Tracer.span('EditTaskDetailsUsecase.setProperty', {
      property,
      value: this.task.value[property],
    });

    this.task.draft();
    this.task.value[property] = value;
    this.task.commit();

    span.end();
  }

  async execute() {}

  async init() {}
}

export const TaskDetails = observer(({ id }: { id: string }) => {
  const store = useStore();

  const task = store.tasks.getById(id);

  const usecase = useMemo(
    () => (task ? new EditTaskDetailsUsecase(task) : null),
    [task],
  );

  const assigneesOptions = useMemo(() => {
    return store.users.toArray().reduce(
      (acc, user) =>
        user?.name
          ? [
              ...acc,
              {
                label: user.name,
                value: user.id,
              },
            ]
          : acc,
      [] as SelectOption[],
    );
  }, [store.users.value.size]);

  if (!task) return null;

  return (
    <div className='pt-2.5 px-4 flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='font-medium'>Task</h1>
        <div className='flex items-center gap-2'>
          {task?.value.status && <TaskStatus value={task.value.status} />}
          <IconButton
            size='xxs'
            variant='ghost'
            aria-label='more'
            icon={<Icon name='dots-vertical' />}
          />
          <IconButton
            size='xxs'
            variant='ghost'
            aria-label='close'
            icon={<Icon name='x-close' />}
            onClick={() => store.ui.setShowPreviewCard(false)}
          />
        </div>
      </div>

      <Input
        size='xxs'
        variant='unstyled'
        className='text-sm'
        placeholder='Task subject'
        value={task?.value.subject ?? ''}
        onChange={(e) => usecase?.setProperty('subject', e.target.value)}
      />

      <div className='flex items-center gap-3'>
        <Icon name='file-02' className='text-grayModern-500' />
        <Input
          size='xxs'
          variant='unstyled'
          value={task?.value.description ?? ''}
          placeholder='Add more context for yourself or someone else'
          onChange={(e) => usecase?.setProperty('description', e.target.value)}
        />
      </div>

      <div className='flex items-center gap-3'>
        <Icon name='user-01' className='text-grayModern-500' />

        <Popover>
          <PopoverTrigger asChild>
            <p className='text-sm text-grayModern-400 hover:underline hover:decoration-dotted cursor-pointer'>
              Add an assignee...
            </p>
          </PopoverTrigger>

          <PopoverContent align='start' className='min-w-[264px] w-[264px]'>
            <Combobox
              className='w-full'
              options={assigneesOptions}
              onChange={(_v) => {
                // usecase?.setProperty('assignees', [v.value]);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className='flex items-center gap-3'>
        <Popover>
          <PopoverAnchor>
            <Icon name='user-01' className='text-grayModern-500' />
          </PopoverAnchor>

          <p className='text-sm'>
            Due in{' '}
            <PopoverTrigger asChild>
              <span className='text-success-600 font-medium hover:underline hover:decoration-dotted cursor-pointer'>
                3 days
              </span>
            </PopoverTrigger>
            , on 12 feb 2025
          </p>

          <PopoverContent align='start' alignOffset={-5}>
            <DatePicker
              onChange={(v) => {
                usecase?.setProperty(
                  'dueAt',
                  new UTCDate(v as Date).toISOString(),
                );
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
});
