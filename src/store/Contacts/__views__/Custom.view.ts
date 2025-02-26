import { inPlaceSort } from 'fast-sort';
import { toJS, action, autorun } from 'mobx';

import { TableViewType } from '@shared/types/__generated__/graphql.types';

import type { Contact } from '../Contact.dto';

import { getContactSortFn } from './sortFns';
import { getContactFilterFns } from './filterFns';
import { ContactsStore } from '../Contacts.store';

// TODO: Cache filtered and sorted results for faster subsequent access
export class CustomView {
  private cachedCombos = new Map<string, string>();
  private cachedSearchCombos = new Map<string, string>();

  constructor(private store: ContactsStore) {
    autorun(() => {
      const customViewDefs = this.store.root.tableViewDefs.customPresets;

      customViewDefs.forEach((viewDef) => {
        if (viewDef.value.tableType !== TableViewType.Contacts) return;

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
      const customViewDefs = this.store.root.tableViewDefs.customPresets;

      const dataSize = this.store.value.size;
      const dataVersion = this.store.version;

      customViewDefs.forEach((viewDef) => {
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

    const defaultFilters = getContactFilterFns(viewDef.getDefaultFilters());
    const activeFilters = getContactFilterFns(viewDef.getFilters());
    const sorting = JSON.parse(viewDef.value.sorting);

    this.store.setView(preset, (data) => {
      const columnId = sorting?.id as string;
      const isDesc = sorting?.desc as boolean;

      const filteredIdsWithSortValues = (data as Contact[]).reduce(
        (acc, curr) => {
          if (!curr) return acc;

          if (
            defaultFilters.every((fn) => fn(curr)) &&
            activeFilters.every((fn) => fn(curr))
          ) {
            const sortValue = getContactSortFn(columnId)(curr);

            acc.push({ record: curr, sortValue });
          }

          return acc;
        },
        [] as {
          record: Contact;
          sortValue:
            | string
            | number
            | boolean
            | Date
            | null
            | undefined
            | (string | undefined)[];
        }[],
      );

      const sorted = inPlaceSort(filteredIdsWithSortValues)
        [isDesc ? 'desc' : 'asc']((entry) => entry.sortValue)
        .map((entry) => entry.record);

      return sorted;
    });
  };
}
