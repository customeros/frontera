import { inPlaceSort } from 'fast-sort';
import { action, reaction } from 'mobx';

import type { Task } from '../Task.dto';

import { Tasks } from '../Tasks.store';
import { getTasksSortFn } from './sortFns';
import { getTasksFilterFns } from './filterFns';

export class TasksView {
  constructor(private store: Tasks) {
    // when new entites are added, removed or updated(by bumping the store version)
    // -> re-compute the view eagerly
    reaction(() => {
      const preset = this.store.root.tableViewDefs.tasksPreset;

      return preset ? this.store.availableCounts.get(preset) : 0;
    }, this.update);
    reaction(() => this.store.value.size, this.update);
    reaction(() => this.store.version, this.update);

    // when cursor is updated by loading next chunk (via scrolling the table)
    reaction(() => {
      const preset = this.store.root.tableViewDefs.tasksPreset;

      return this.store.cursors.get(preset!);
    }, this.update);

    // when the table view def is changed by updating a filter/sort rule
    // -> do an async search to fetch a new list of ids
    reaction(
      () => {
        const preset = this.store.root.tableViewDefs.tasksPreset;

        if (!preset) return '';

        const viewDef = this.store.root.tableViewDefs.getById(preset);

        const columns = JSON.stringify(viewDef?.value.columns);

        return `${viewDef?.value.filters ?? ''}-${
          viewDef?.value.defaultFilters ?? ''
        }-${viewDef?.value.sorting}-${columns}`;
      },
      () => this.store.search(this.store.root.tableViewDefs.tasksPreset!),
    );

    // when the table view def is changed by updating a filter/sort rule
    // -> filter + sort the current entities in the store to optimistically update the table view
    reaction(() => {
      const preset = this.store.root.tableViewDefs.tasksPreset;

      if (!preset) return '';

      const viewDef = this.store.root.tableViewDefs.getById(preset);
      const columns = JSON.stringify(viewDef?.value.columns);

      return `${viewDef?.value.filters ?? ''}-${
        viewDef?.value.defaultFilters ?? ''
      }-${viewDef?.value.sorting}-${columns}`;
    }, this.update);
  }

  @action
  public update = () => {
    const preset = this.store.root.tableViewDefs.tasksPreset;

    if (!preset) return;

    const viewDef = this.store.root.tableViewDefs.getById(preset);

    if (!viewDef) return;

    const defaultFilters = getTasksFilterFns(viewDef.getDefaultFilters());
    const activeFilters = getTasksFilterFns(viewDef.getFilters());
    const sorting = JSON.parse(viewDef.value.sorting);

    this.store.setView(preset, (data) => {
      const columnId = sorting?.id as string;
      const isDesc = sorting?.desc as boolean;

      const filteredIdsWithSortValues = (data as Task[]).reduce(
        (acc, curr) => {
          if (!curr) return acc;

          if (
            defaultFilters.every((fn) => fn(curr)) &&
            activeFilters.every((fn) => fn(curr))
          ) {
            const sortValue = getTasksSortFn(columnId)(curr);

            acc.push({ record: curr, sortValue });
          }

          return acc;
        },
        [] as {
          record: Task;
          sortValue: string | number | boolean | Date | null | undefined;
        }[],
      );

      const sorted = inPlaceSort(filteredIdsWithSortValues)
        [isDesc ? 'desc' : 'asc']((entry) => entry.sortValue)
        .map((entry) => entry.record);

      return sorted;
    });
  };
}
