import { RootStore } from '@store/root';

import { Icon } from '@ui/media/Icon';
import {
  TaskStatus,
  ColumnViewType,
  ComparisonOperator,
} from '@shared/types/__generated__/graphql.types';
export type FilterType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any[];
  icon: JSX.Element;
  filterName: string;
  filterAccesor: ColumnViewType;
  filterOperators: ComparisonOperator[];
  filterType: 'text' | 'date' | 'number' | 'list';
  groupOptions?: { label: string; options: { id: string; label: string }[] };
};

export const getTasksFilterTypes = (store?: RootStore) => {
  const filterTypes: Partial<Record<ColumnViewType, FilterType>> = {
    [ColumnViewType.TasksSubject]: {
      filterType: 'text',
      filterName: 'Task',
      filterAccesor: ColumnViewType.TasksSubject,
      filterOperators: [
        ComparisonOperator.Contains,
        ComparisonOperator.NotContains,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <Icon
          name='clipboard-text'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
    },
    [ColumnViewType.TasksStatus]: {
      filterType: 'list',
      filterName: 'Status',
      filterAccesor: ColumnViewType.TasksStatus,
      filterOperators: [ComparisonOperator.In, ComparisonOperator.NotIn],
      icon: (
        <Icon
          name='columns-03'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
      options: [
        { id: TaskStatus.Todo, label: 'Todo' },
        { id: TaskStatus.InProgress, label: 'In progress' },
        { id: TaskStatus.Done, label: 'Done' },
      ],
    },
    [ColumnViewType.TasksDueDate]: {
      filterType: 'date',
      filterName: 'Due date',
      filterAccesor: ColumnViewType.TasksDueDate,
      filterOperators: [ComparisonOperator.Gt, ComparisonOperator.Lt],
      icon: (
        <Icon
          name='calendar'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
    },
    [ColumnViewType.TasksAssignees]: {
      filterType: 'list',
      filterName: 'Assignees',
      filterAccesor: ColumnViewType.TasksAssignees,
      filterOperators: [ComparisonOperator.In, ComparisonOperator.NotIn],
      icon: (
        <Icon
          name='user-01'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
      options: store?.users
        .toArray()
        .filter(
          (user) => !user.value.internal && !user.value.bot && !user.value.test,
        )
        .map((user) => ({
          id: user?.id,
          label: user?.name,
          avatar: user?.value?.profilePhotoUrl,
        })),
    },
    [ColumnViewType.TasksCreatedAt]: {
      filterType: 'date',
      filterName: 'Created date',
      filterAccesor: ColumnViewType.TasksCreatedAt,
      filterOperators: [ComparisonOperator.Gt, ComparisonOperator.Lt],
      icon: (
        <Icon
          name='calendar'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
    },
    [ColumnViewType.TasksUpdatedAt]: {
      filterType: 'date',
      filterName: 'Updated in',
      filterAccesor: ColumnViewType.TasksUpdatedAt,
      filterOperators: [ComparisonOperator.Gt, ComparisonOperator.Lt],
      icon: (
        <Icon
          name='calendar'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
    },
  };

  return filterTypes;
};
