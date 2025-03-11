import { match } from 'ts-pattern';

import { TaskStatus, ColumnViewType } from '@graphql/types';

import { Task } from '../Task.dto';

export const getTasksSortFn = (columnId: string) =>
  match(columnId)
    .with(ColumnViewType.TasksSubject, () => (row: Task) => {
      if (!row || !row.value.subject || row.value.subject.trim() === '')
        return null;

      return row.value.subject.trim().toLowerCase();
    })
    .with(ColumnViewType.TasksStatus, () => (row: Task) => {
      if (!row || !row.value.status) return null;

      return match(row?.value.status)
        .with(TaskStatus.Todo, () => 1)
        .with(TaskStatus.InProgress, () => 2)
        .with(TaskStatus.Done, () => 3)
        .otherwise(() => null);
    })
    .with(ColumnViewType.TasksAssignees, () => (row: Task) => {
      if (!row || !row.firstAssignee) return null;

      return row.firstAssignee.name.trim().toLowerCase();
    })
    .with(ColumnViewType.TasksDueDate, () => (row: Task) => {
      if (!row || !row.value.dueAt) return null;

      return new Date(row.value.dueAt);
    })
    .with(ColumnViewType.TasksCreatedAt, () => (row: Task) => {
      if (!row || !row.value.createdAt) return null;

      return new Date(row.value.createdAt);
    })
    .with(ColumnViewType.TasksUpdatedAt, () => (row: Task) => {
      if (!row || !row.value.updatedAt) return null;

      return new Date(row.value.updatedAt);
    })
    .otherwise(() => (_row: Task) => false);
