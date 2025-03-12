import type { FilterItem } from '@store/types';

import { match } from 'ts-pattern';
import { set } from 'date-fns/set';
import { isBefore } from 'date-fns';
import { isAfter } from 'date-fns/isAfter';

import { Filter, ColumnViewType, ComparisonOperator } from '@graphql/types';

import { Task } from '../Task.dto';

const getFilterFn = (filter: FilterItem | undefined | null) => {
  const noop = (_row: Task) => true;

  if (!filter) return noop;

  return match(filter)
    .with(
      { property: ColumnViewType.TasksSubject },
      (filter) => (row: Task) => {
        if (!filter.active) return true;
        const values = row?.value.subject?.toLowerCase();

        return filterTypeText(filter, values);
      },
    )
    .with({ property: ColumnViewType.TasksStatus }, (filter) => (row: Task) => {
      if (!filter.active) return true;
      const filterValues = filter?.value;

      if (!filterValues || !row?.value.status) return false;

      return filterTypeList(
        filter,
        Array.isArray(row?.value.status)
          ? row?.value.status
          : [row?.value.status],
      );
    })
    .with(
      { property: ColumnViewType.TasksAssignees },
      (filter) => (row: Task) => {
        if (!filter.active) return true;
        const filterValues = filter?.value;

        if (!filterValues || !row?.value.assignees) return false;

        return filterTypeList(filter, row?.value.assignees);
      },
    )
    .with(
      { property: ColumnViewType.TasksDueDate },
      (filter) => (row: Task) => {
        if (!filter.active) return true;
        const filterValues = filter?.value;

        if (!filterValues || !row?.value.dueAt) return false;

        return filterTypeDate(filter, row?.value.dueAt);
      },
    )
    .with(
      { property: ColumnViewType.TasksCreatedAt },
      (filter) => (row: Task) => {
        if (!filter.active) return true;
        const filterValues = filter?.value;

        if (!filterValues || !row?.value.createdAt) return false;

        return filterTypeDate(filter, row?.value.createdAt);
      },
    )
    .otherwise(() => noop);
};

const filterTypeText = (filter: FilterItem, value: string | undefined) => {
  const filterValue = filter?.value?.toLowerCase();
  const filterOperator = filter?.operation;
  const valueLower = value?.toLowerCase();

  return match(filterOperator)
    .with(ComparisonOperator.IsEmpty, () => !value)
    .with(ComparisonOperator.IsNotEmpty, () => value)
    .with(
      ComparisonOperator.NotContains,
      () => !valueLower?.includes(filterValue),
    )
    .with(ComparisonOperator.Contains, () => valueLower?.includes(filterValue))
    .otherwise(() => false);
};

const filterTypeList = (filter: FilterItem, value: string[] | undefined) => {
  const filterValue = filter?.value;
  const filterOperator = filter?.operation;

  return match(filterOperator)
    .with(ComparisonOperator.IsEmpty, () => !value?.length)
    .with(ComparisonOperator.IsNotEmpty, () => value?.length)
    .with(ComparisonOperator.NotIn, () => {
      return !value?.some((v) => filterValue?.includes(v));
    })
    .with(
      ComparisonOperator.In,
      () => value?.length && value.some((v) => filterValue?.includes(v)),
    )
    .otherwise(() => false);
};

const filterTypeDate = (filter: FilterItem, value: string | undefined) => {
  const filterValue = filter?.value;
  const filterOperator = filter?.operation;

  if (!value) return false;

  const left = set(new Date(value), { hours: 0, minutes: 0, seconds: 0 });
  const right = set(new Date(filterValue), {
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  return match(filterOperator)
    .with(ComparisonOperator.Lt, () => isBefore(left, right))
    .with(ComparisonOperator.Gt, () => isAfter(left, right))

    .otherwise(() => true);
};

export const getTasksFilterFns = (filters: Filter | null) => {
  if (!filters || !filters.AND) return [];

  const data = filters?.AND;

  return data.map(({ filter }) => getFilterFn(filter));
};
