import {
  ColumnDef,
  ColumnDef as ColumnDefinition,
} from '@tanstack/react-table';
import { getColumnConfig } from '@finder/components/Columns/shared/util/getColumnConfig';

import { Skeleton } from '@ui/feedback/Skeleton/Skeleton';
import { createColumnHelper } from '@ui/presentation/Table';
import { Task, TableViewDef, ColumnViewType } from '@graphql/types';
import THead, { getTHeadProps } from '@ui/presentation/Table/THead';

import {
  DueDateCell,
  TaskNameCell,
  TaskStatusCell,
  CreatedDateCell,
} from './cells';

type ColumnDatum = Task;

// REASON: we do not care about exhaustively typing this TValue type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Column = ColumnDefinition<ColumnDatum, any>;

const columnHelper = createColumnHelper<ColumnDatum>();

export const columns: Record<string, Column> = {
  [ColumnViewType.TasksSubject]: columnHelper.accessor((row) => row, {
    id: ColumnViewType.TasksSubject,
    size: 200,
    minSize: 200,
    maxSize: 400,
    enableColumnFilter: false,
    enableSorting: false,
    enableResizing: true,
    cell: (props) => {
      return <TaskNameCell task={props.getValue()} />;
    },
    header: (props) => (
      <THead<HTMLInputElement>
        title='Task'
        id={ColumnViewType.TasksSubject}
        {...getTHeadProps<Task>(props)}
      />
    ),
    skeleton: () => <Skeleton className='w-[100px] h-[14px]' />,
  }),
  [ColumnViewType.TasksAssignees]: columnHelper.accessor((row) => row, {
    id: ColumnViewType.TasksAssignees,
    size: 200,
    minSize: 200,
    maxSize: 400,
    enableColumnFilter: false,
    enableResizing: false,
    cell: (props) => {
      const asigness = props.getValue().firstAssignee?.name;

      return asigness ? (
        <p>{asigness}</p>
      ) : (
        <p className='text-grayModern-400'>Not assigned yet</p>
      );
    },
    header: (props) => (
      <THead<HTMLInputElement>
        title='Assignees'
        id={ColumnViewType.TasksAssignees}
        {...getTHeadProps<Task>(props)}
      />
    ),
    skeleton: () => <Skeleton className='w-[100px] h-[14px]' />,
  }),
  [ColumnViewType.TasksStatus]: columnHelper.accessor((row) => row, {
    id: ColumnViewType.TasksStatus,
    size: 150,
    minSize: 150,
    maxSize: 200,
    enableColumnFilter: false,
    enableResizing: false,
    cell: (props) => {
      return <TaskStatusCell taskId={props.getValue().id} />;
    },
    header: (props) => (
      <THead<HTMLInputElement>
        title='Status'
        id={ColumnViewType.TasksStatus}
        {...getTHeadProps<Task>(props)}
      />
    ),
    skeleton: () => <Skeleton className='w-[100px] h-[14px]' />,
  }),
  [ColumnViewType.TasksDueDate]: columnHelper.accessor((row) => row, {
    id: ColumnViewType.TasksDueDate,
    size: 150,
    minSize: 150,
    maxSize: 200,
    enableColumnFilter: false,
    enableResizing: false,
    cell: (props) => {
      return <DueDateCell dueDate={props.getValue().value.dueAt} />;
    },
    header: (props) => (
      <THead<HTMLInputElement>
        title='Due In'
        id={ColumnViewType.TasksDueDate}
        {...getTHeadProps<Task>(props)}
      />
    ),
    skeleton: () => <Skeleton className='w-[100px] h-[14px]' />,
  }),
  [ColumnViewType.TasksCreatedAt]: columnHelper.accessor((row) => row, {
    id: ColumnViewType.TasksCreatedAt,
    size: 150,
    minSize: 150,
    maxSize: 200,
    enableColumnFilter: false,
    enableResizing: false,
    cell: (props) => {
      return <CreatedDateCell date={props.getValue().value.createdAt} />;
    },
    header: (props) => (
      <THead<HTMLInputElement>
        title='Created'
        id={ColumnViewType.TasksCreatedAt}
        {...getTHeadProps<Task>(props)}
      />
    ),
    skeleton: () => <Skeleton className='w-[100px] h-[14px]' />,
  }),
  [ColumnViewType.TasksUpdatedAt]: columnHelper.accessor((row) => row, {
    id: ColumnViewType.TasksUpdatedAt,
    size: 150,
    minSize: 150,
    maxSize: 200,
    enableColumnFilter: false,
    enableResizing: false,
    cell: (props) => {
      return <p>{props.getValue().updatedAt}</p>;
    },
    header: (props) => (
      <THead<HTMLInputElement>
        title='Updated'
        id={ColumnViewType.TasksUpdatedAt}
        {...getTHeadProps<Task>(props)}
      />
    ),
    skeleton: () => <Skeleton className='w-[100px] h-[14px]' />,
  }),
};

export const getTasksColumnsConfig = (
  tableViewDef?: Array<TableViewDef>[0],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<ColumnDatum, any>[] =>
  getColumnConfig<ColumnDatum>(columns, tableViewDef);
