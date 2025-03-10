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

export const getTasksFilterTypes = () => {
  const filterTypes: Partial<Record<ColumnViewType, FilterType>> = {
    [ColumnViewType.TasksSubject]: {
      filterType: 'text',
      filterName: 'Subject',
      filterAccesor: ColumnViewType.TasksSubject,
      filterOperators: [
        ComparisonOperator.Contains,
        ComparisonOperator.NotContains,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <Icon
          name='message-text-circle-01'
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
          name='message-text-circle-01'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
      options: [
        { id: TaskStatus.Todo, label: 'To do' },
        { id: TaskStatus.InProgress, label: 'In Progress' },
        { id: TaskStatus.Done, label: 'Done' },
      ],
    },
    [ColumnViewType.TasksDueDate]: {
      filterType: 'date',
      filterName: 'Due in',
      filterAccesor: ColumnViewType.TasksDueDate,
      filterOperators: [ComparisonOperator.Lte],
      icon: (
        <Icon
          name='message-text-circle-01'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
    },
    [ColumnViewType.TasksCreatedAt]: {
      filterType: 'date',
      filterName: 'Created in',
      filterAccesor: ColumnViewType.TasksCreatedAt,
      filterOperators: [ComparisonOperator.Lte],
      icon: (
        <Icon
          name='message-text-circle-01'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
    },
    [ColumnViewType.TasksUpdatedAt]: {
      filterType: 'date',
      filterName: 'Updated in',
      filterAccesor: ColumnViewType.TasksUpdatedAt,
      filterOperators: [ComparisonOperator.Lte],
      icon: (
        <Icon
          name='message-text-circle-01'
          className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5'
        />
      ),
    },
  };

  return filterTypes;
};
