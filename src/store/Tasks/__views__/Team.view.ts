import { inPlaceSort } from 'fast-sort';
import { toJS, action, autorun } from 'mobx';

import { TableViewType } from '@shared/types/__generated__/graphql.types';

import type { Task } from '../Task.dto';

import { Tasks } from '../Tasks.store';
import { getTasksSortFn } from './sortFns';
import { getTasksFilterFns } from './filterFns';

export class TeamViews {
  private cachedCombos = new Map<string, string>();
  private cachedSearchCombos = new Map<string, string>();

  constructor(private store: Tasks) {
    autorun(() => {
      const teamViewDefs = this.store.root.tableViewDefs.teamPresets;

      teamViewDefs.forEach((viewDef) => {
        if (viewDef.value.tableType !== TableViewType.Tasks) return;

        const preset = viewDef?.value.id;
        const combo = [
          viewDef.value?.defaultFilters,
          viewDef.value?.filters,
          viewDef.value?.sorting,
          JSON.stringify(toJS(viewDef.value.columns)),
        ].join('-');

        if (this.cachedSearchCombos.get(preset) === combo) return;

        this.cachedSearchCombos.set(preset, combo);

        this.store.search(preset);
      });
    });

    autorun(() => {
      const teamViewDefs = this.store.root.tableViewDefs.teamPresets;

      const dataSize = this.store.value.size;
      const dataVersion = this.store.version;

      teamViewDefs.forEach((viewDef) => {
        if (viewDef.value.tableType !== TableViewType.Tasks) return;

        const preset = viewDef?.value.id;
        const combo = [
          viewDef.value?.defaultFilters,
          viewDef.value?.filters,
          viewDef.value?.sorting,
          JSON.stringify(toJS(viewDef.value.columns)),
          dataSize,
          dataVersion,
        ].join('-');

        if (this.cachedCombos.get(preset) === combo) return;

        this.cachedCombos.set(preset, combo);

        this.update(preset);
      });
    });
  }

  @action
  public update = (preset: string) => {
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
