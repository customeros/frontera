import { Channel } from 'phoenix';
import { RootStore } from '@store/root';
import { makeAutoObservable } from 'mobx';
import { Transport } from '@infra/transport';
import { GroupOperation } from '@store/types';
import { GroupStore, makeAutoSyncableGroup } from '@store/group-store';

import { PageView } from '@graphql/types';

import { PageViewStore } from './PageView.store';

export class PageViewsStore implements GroupStore<PageView> {
  channel?: Channel | undefined;
  error: string | null = null;
  history: GroupOperation[] = [];
  isBootstrapped: boolean = false;
  isLoading: boolean = false;
  version: number = 0;
  totalElements: number = 0;
  value: Map<string, PageViewStore> = new Map();
  sync = makeAutoSyncableGroup.sync;
  load = makeAutoSyncableGroup.load<PageView>();
  subscribe = makeAutoSyncableGroup.subscribe;

  constructor(public root: RootStore, public transport: Transport) {
    makeAutoObservable(this);
    makeAutoSyncableGroup(this, {
      channelName: 'PageViews',
      getItemId: (item) => item.id,
      ItemStore: PageViewStore,
    });
  }
}
