import { match } from 'ts-pattern';
import { Task } from '@store/Tasks/Task.dto';

import { DateTimeUtils } from '@utils/date';
import { TaskStatus, ColumnViewType } from '@graphql/types';

export const csvDataMapper = {
  [ColumnViewType.TasksSubject]: (d: Task) => {
    return d?.value?.subject;
  },
  [ColumnViewType.TasksAssignees]: (d: Task) =>
    d.getUserName(d?.value?.assignees?.[0]),

  [ColumnViewType.TasksDueDate]: (d: Task) =>
    d?.value?.dueAt
      ? DateTimeUtils.format(d.value.dueAt, DateTimeUtils.iso8601)
      : 'No date yet',

  [ColumnViewType.TasksStatus]: (d: Task) => {
    return match(d?.value?.status)
      .with(TaskStatus.Todo, () => 'Todo')
      .with(TaskStatus.InProgress, () => 'In Progress')
      .with(TaskStatus.Done, () => 'Done')
      .otherwise(() => 'No status');
  },
  [ColumnViewType.TasksCreatedAt]: (d: Task) =>
    d?.value?.createdAt
      ? DateTimeUtils.format(d.value.createdAt, DateTimeUtils.iso8601)
      : 'No date yet',
};
