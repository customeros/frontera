import type { TableViewDefStore } from '@store/TableViewDefs/TableViewDef.store';
import type {
  TableViewDef,
  TableViewDefDatum,
} from '@store/TableViewDefs/TableViewDef.dto';

import { View } from '@/lib/view/view';
import { Tracer } from '@/infra/tracer';
import { inPlaceSort } from 'fast-sort';
import { unwrap } from '@/utils/unwrap';
import { RootStore } from '@/store/root';
import { Organization } from '@/domain/entities';
import { ViewStore } from '@/lib/view/view-store';
import { registry } from '@/domain/stores/registry';
import { reaction, runInAction, ObservableMap } from 'mobx';
import { OrganizationRepository } from '@/infra/repositories/core/organization';

import { TableViewType } from '@shared/types/__generated__/graphql.types';

import { getOrganizationSortFn } from './sort';
import { getOrganizationFilterFns } from './filters';

interface ViewModel {
  data: Organization[];
  totalElements: number;
  totalAvailable: number;
}

export const viewRegistry = new ViewStore<ViewModel>({
  cache: ObservableMap,
  mutator: runInAction,
});

export class OrganizationViews {
  private disposers = new Map<string, () => void>();
  static instance: OrganizationViews;

  constructor(
    private viewDefStore: TableViewDefStore,
    private organizationRepo: OrganizationRepository,
    private organizationStore = registry.get('organizations'),
  ) {
    if (!OrganizationViews.instance) {
      OrganizationViews.instance = this;
    }
  }

  async init() {
    const span = Tracer.span('OrganizationViews.init');

    const promises: Promise<void>[] = [];

    for (const [_, viewDef] of this.viewDefStore.value) {
      if (viewDef.value.tableType !== TableViewType.Organizations) continue;

      promises.push(this.setup(viewDef));
    }

    await Promise.all(promises);

    span.end();
  }

  async setup(viewDef: TableViewDef) {
    await this.set(viewDef);

    this.disposers.delete(viewDef.id);

    const disposer = reaction(
      () =>
        [
          viewDef.value.defaultFilters,
          viewDef.value.filters,
          viewDef.value.sorting,
          viewDef.value.columns,
        ]
          .map((v) => JSON.stringify(v))
          .join('-'),
      () => {
        queueMicrotask(() => {
          void this.set(viewDef);
        });
      },
    );

    this.disposers.set(viewDef.id, disposer);
  }

  async set(viewDef: TableViewDef) {
    const span = Tracer.span(`OrganizationViews.set.${viewDef.id}`, {
      id: viewDef.id,
      name: viewDef.name,
      defaultFilters: viewDef.value.defaultFilters,
      filters: viewDef.value.filters,
      sorting: viewDef.value.sorting,
    });

    const prev = viewRegistry.get(viewDef.value);

    let totalAvailable = prev?.totalAvailable ?? 0;
    let totalElements = prev?.totalElements ?? 0;

    const view = new View<Omit<TableViewDefDatum, 'columns'>, ViewModel>(
      viewDef.value,
      () => this.computeView(viewDef, totalElements, totalAvailable, span),
      viewRegistry,
    );

    const searchPayload = viewDef.toSearchPayload();

    const [searchRes, searchErr] = await unwrap(
      this.organizationRepo.searchOrganizations({ ...searchPayload }),
    );

    if (searchErr) {
      console.error(
        'OrganizationViews.set: Error while searching organizations',
        searchErr,
      );

      return;
    }

    totalAvailable = searchRes?.ui_organizations_search.totalAvailable;
    totalElements = searchRes?.ui_organizations_search.totalElements;

    view.invalidate();

    const [retrieveRes, retrieveErr] = await unwrap(
      this.organizationRepo.getOrganizationsByIds({
        ids: searchRes?.ui_organizations_search.ids,
      }),
    );

    if (retrieveErr) {
      console.error(
        'OrganizationViews.set: Error while retrieving organizations',
        retrieveErr,
      );

      return;
    }

    if (retrieveRes?.ui_organizations) {
      for (const data of retrieveRes.ui_organizations) {
        this.organizationStore.suspendSync(() => {
          this.organizationStore.set(data.id, new Organization(data));
        });
      }
    }

    view.invalidate();
  }

  dispose() {
    for (const disposer of this.disposers.values()) {
      disposer();
    }
    this.disposers.clear();
  }

  private computeView(
    viewDef: TableViewDef,
    totalElements?: number,
    totalAvailable?: number,
    span?: ReturnType<typeof Tracer.span>,
  ): ViewModel {
    const defaultFilterFns = getOrganizationFilterFns(
      viewDef.getDefaultFilters(),
      RootStore.getInstance(),
    );
    const activeFilterFns = getOrganizationFilterFns(
      viewDef.getFilters(),
      RootStore.getInstance(),
    );
    const sorting = JSON.parse(viewDef.value.sorting);

    const filteredWithSortValues: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sortValue: any;
      record: Organization;
    }[] = [];

    const isDesc = sorting?.desc as boolean;

    for (const [_, v] of this.organizationStore.cache) {
      const colId = sorting?.id as string;

      if (
        defaultFilterFns.every((fn) => fn(v)) &&
        activeFilterFns.every((fn) => fn(v))
      ) {
        const sortValue = getOrganizationSortFn(colId)(v);

        filteredWithSortValues.push({ record: v, sortValue });
      }
    }

    const data = inPlaceSort(filteredWithSortValues)
      [isDesc ? 'desc' : 'asc']((e) => e.sortValue)
      .map((e) => e.record);

    if (span) {
      span.end();
    }

    return {
      data,
      totalElements: totalElements ?? 0,
      totalAvailable: totalAvailable ?? 0,
    };
  }

  private shouldRevalidate(viewDef: TableViewDef, entity: Organization) {
    const defaultFilterFns = getOrganizationFilterFns(
      viewDef.getDefaultFilters(),
      RootStore.getInstance(),
    );
    const activeFilterFns = getOrganizationFilterFns(
      viewDef.getFilters(),
      RootStore.getInstance(),
    );

    if (
      defaultFilterFns.every((fn) => fn(entity)) &&
      activeFilterFns.every((fn) => fn(entity))
    ) {
      return true;
    }

    return false;
  }

  static mutateCache(fn: (v: ViewModel) => void) {
    viewRegistry.cache.forEach(fn);
  }

  static async revalidate(organization: Organization) {
    for (const [_, viewDef] of this.instance.viewDefStore.value) {
      if (viewDef.value.tableType !== TableViewType.Organizations) continue;

      if (this.instance.shouldRevalidate(viewDef, organization)) {
        await this.instance.setup(viewDef);
      }
      continue;
    }
  }
}
