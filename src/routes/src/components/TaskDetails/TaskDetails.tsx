import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { format } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import { observer } from 'mobx-react-lite';
import { EditTaskDetailsUsecase } from '@domain/usecases/tasks/edit-task.usecase';

import { Icon } from '@ui/media/Icon';
import { Combobox } from '@ui/form/Combobox';
import { SelectOption } from '@ui/utils/types';
import { Button } from '@ui/form/Button/Button';
import { DatePicker } from '@ui/form/DatePicker';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Textarea } from '@ui/form/Textarea/Textarea';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { TaskStatus } from '@shared/components/TaskStatus';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@ui/overlay/Popover';
export const TaskDetails = observer(({ id }: { id: string }) => {
  const [searchParams] = useSearchParams();
  const preset = searchParams.get('preset');

  if (!id) return null;
  const store = useStore();

  const task = store.tasks.getById(id);

  const usecase = useMemo(() => new EditTaskDetailsUsecase(task!), [task]);

  const assigneesOptions = useMemo(() => {
    return store.users
      .toArray()
      .filter(
        (user) => !user.value.internal && !user.value.bot && !user.value.test,
      )
      .reduce(
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

  const createdBy = useMemo(() => {
    if (!task.value.authorId) return null;
    const user = store.users.getById(task.value.authorId);

    if (!user) return null;

    return user.name;
  }, [task?.id]);

  const opportunitiesOptions = store.opportunities
    .toArray()
    .filter((o) => o.value.name)
    .map((o) => ({
      label: o.value.name,
      value: o.id,
    }));

  const opportunity = store.opportunities.value.get(
    task.value.opportunityIds[0],
  );

  const prevOpportunity = useMemo(() => {
    if (!preset) {
      return store.opportunities.value.get(task.value.opportunityIds[0]);
    }

    return null;
  }, [preset]);

  const assignees = task.value.assignees.map((id) => store.users.getById(id));

  return (
    <div className='pt-2.5 px-4 flex flex-col gap-4 justify-start'>
      <div className='flex items-start justify-between pt-[3px]'>
        <Textarea
          size='xxs'
          variant='unstyled'
          placeholder='Unnamed task'
          className='text-sm font-medium'
          value={task?.value.subject ?? ''}
          onChange={(e) => {
            usecase?.setProperty('subject', e.target.value);
          }}
          onBlur={() => {
            if (task.value.subject?.length === 0) {
              usecase.setProperty(
                'subject',
                'Unnamed task: In need of a name ',
              );
            }
            usecase.execute();
          }}
        />
        <div className='flex items-start gap-2'>
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
      <Tooltip align='start' label='Context of task'>
        <div className='flex items-center gap-3'>
          <Icon name='file-02' className='text-grayModern-500' />
          <Textarea
            size='xxs'
            variant='unstyled'
            value={task?.value.description ?? ''}
            placeholder='Add more context for yourself or someone else'
            onBlur={() => {
              usecase?.execute();
            }}
            onChange={(e) =>
              usecase?.setProperty('description', e.target.value)
            }
          />
        </div>
      </Tooltip>

      <div className='flex items-center gap-3'>
        <Icon name='columns-03' className='text-grayModern-500' />
        {task?.value.status && (
          <TaskStatus usecase={usecase} value={task.value.status} />
        )}
      </div>

      <div className='flex items-center gap-3'>
        <Icon name='user-01' className='text-grayModern-500' />

        <Popover>
          <PopoverTrigger asChild>
            {assignees.length > 0 ? (
              <p className='text-sm cursor-pointer'>
                Assigned to{' '}
                <span className='font-medium'>{assignees[0]?.name}</span>
              </p>
            ) : (
              <span className='text-sm text-grayModern-400 cursor-pointer'>
                Add an assignee...
              </span>
            )}
          </PopoverTrigger>

          <PopoverContent align='start' className='min-w-[264px] w-[264px]'>
            <Combobox
              className='w-full'
              options={assigneesOptions}
              onChange={(v) => {
                usecase?.setProperty('assignees', v.value);
                usecase?.execute();
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className='flex items-center gap-3'>
        <Popover>
          <PopoverAnchor>
            <Icon name='clock-fast-forward' className='text-grayModern-500' />
          </PopoverAnchor>

          <div className='text-sm flex items-center'>
            {task.value.dueAt ? (
              <>
                {(() => {
                  const dueDate = new Date(task.value.dueAt || '');
                  const today = new Date();
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  if (diffDays > 0) {
                    return (
                      <>
                        <PopoverTrigger asChild>
                          <span className='gap-1 cursor-pointer'>
                            Due in{' '}
                            <span className='text-success-600 font-medium '>
                              {`${diffDays} day${diffDays !== 1 ? 's' : ''}`}
                            </span>
                            <span>
                              , on{' '}
                              {format(new Date(task.value.dueAt), 'd MMM yyyy')}
                            </span>
                          </span>
                        </PopoverTrigger>
                      </>
                    );
                  } else if (diffDays === 0) {
                    return (
                      <>
                        <PopoverTrigger asChild>
                          <span className='gap-1 cursor-pointer'>
                            Due{' '}
                            <span className='text-success-600 font-medium '>
                              today
                            </span>
                          </span>
                        </PopoverTrigger>
                      </>
                    );
                  } else if (diffDays < 0) {
                    const daysAgo = Math.abs(diffDays);

                    return (
                      <>
                        <PopoverTrigger asChild>
                          <span className='gap-1 cursor-pointer'>
                            Due{' '}
                            <span className='text-error-700 font-medium '>
                              {`${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}
                            </span>
                            <span>
                              , on{' '}
                              {format(new Date(task.value.dueAt), 'd MMM yyyy')}
                            </span>
                          </span>
                        </PopoverTrigger>
                      </>
                    );
                  }

                  return 'Due';
                })()}
              </>
            ) : (
              <PopoverTrigger asChild>
                <span className='text-grayModern-400 cursor-pointer'>
                  Set a due date
                </span>
              </PopoverTrigger>
            )}
          </div>

          <PopoverContent align='start' alignOffset={-5}>
            <DatePicker
              onChange={(v) => {
                usecase?.setProperty(
                  'dueAt',
                  new UTCDate(v as Date).toISOString(),
                );
                usecase?.execute();
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className='flex items-center gap-3'>
        <Icon name='calendar-plus-02' className='text-grayModern-500' />
        <p className='text-sm'>
          Created on {format(new Date(task.value.createdAt), 'd MMM yyyy')}
        </p>
      </div>

      <div className='flex items-center gap-3'>
        <Icon name='user-plus-01' className='text-grayModern-500' />
        <p className='text-sm '>
          Created by <span className='font-medium'>{createdBy}</span>
        </p>
      </div>
      <div className='flex items-center gap-3'>
        <Icon name='coins-stacked-01' className='text-grayModern-500' />
        <Popover>
          <PopoverTrigger asChild>
            {opportunity?.value?.name ? (
              <p className='text-sm cursor-pointer'>
                Linked to{' '}
                <span className='font-medium'>{opportunity.value.name}</span>
              </p>
            ) : (
              <span className='text-sm text-grayModern-400 cursor-pointer'>
                Link an opportunity
              </span>
            )}
          </PopoverTrigger>

          <PopoverContent align='start' alignOffset={-5}>
            <Combobox
              className='max-w-[340px]'
              options={opportunitiesOptions}
              placeholder='Link an opportunity...'
              onChange={(v) => {
                usecase?.setProperty('opportunityIds', v.value);

                if (!preset && prevOpportunity) {
                  prevOpportunity.value.taskIds = [];
                }
                store.opportunities.value
                  .get(v.value)
                  ?.value.taskIds.push(task.id);
                usecase?.execute();
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {!preset && (
        <Button
          leftIcon={<Icon name='link-broken-02' />}
          onClick={() => {
            usecase?.removeOpportunity(opportunity?.id ?? '');
            store.ui.setShowPreviewCard(false);
          }}
        >
          Unlink this task
        </Button>
      )}
    </div>
  );
});
