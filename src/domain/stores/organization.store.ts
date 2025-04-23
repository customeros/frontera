import { Channel } from 'phoenix';
import { Store } from '@/lib/store/store';
import { Transport } from '@/infra/transport';
import { Organization } from '@/domain/entities';
import { reaction, runInAction, ObservableMap } from 'mobx';
import { sessionStore } from '@/domain/stores/session.store';
import { OrganizationRepository } from '@/infra/repositories/core/organization';
import { OrganizationViews } from '@/domain/views/organization/organization.views';
import {
  FetchPolicy,
  applyPolicies,
  RealtimePolicy,
  PolicyEnhancedStore,
} from '@/lib/policy';

const transport = Transport.getInstance('core');
const repository = new OrganizationRepository();

let channel: Channel | null = null;

const getChannel = () => {
  if (!channel && transport.socket) {
    channel = transport.socket?.channel('OrganizationStore:PureThePhantom', {
      ...transport.channelMeta,
    });
  }

  return channel;
};

const store = new Store<Organization>({
  indexBy: 'id',
  cache: ObservableMap,
  mutator: runInAction,
});

const fetchOrganization = async (id: string) => {
  const res = await repository.getOrganizationsByIds({ ids: [id] });

  return new Organization(res.ui_organizations?.[0]);
};

const fetchPolicy = new FetchPolicy(async ({ key }) => {
  return await fetchOrganization(key as string);
});

const realtimePolicy = new RealtimePolicy<Organization>(getChannel, {
  versionBy: 'updatedAt',
  whenReady: (ready) =>
    reaction(() => sessionStore.isAuthenticated, ready, {
      fireImmediately: true,
    }),
  fetchOnInvalidate: async (id) => {
    return await fetchOrganization(id as string);
  },
  onEvent: (p) => {
    if (p.type === 'store:set') {
      const datum = !p.value
        ? { id: p.key, updatedAt: new Date().toISOString() }
        : p.value;

      if (!p.value) {
        // receive create events from system
        fetchOrganization(p.key).then((o) => {
          (store as PolicyEnhancedStore).suspendSync(() => {
            store.set(p.key, o);
          });

          OrganizationViews.revalidate(new Organization(datum));
        });
      } else {
        OrganizationViews.revalidate(new Organization(datum));
      }
    }

    if (p.type === 'store:delete') {
      OrganizationViews.mutateCache((view) => {
        const index = view.data.findIndex((o) => o.id === p.key);

        if (index > -1) {
          runInAction(() => {
            view.data = view.data.filter((o) => o.id !== p.key);
            view.totalElements--;
            view.totalAvailable--;
          });
        }
      });
    }
  },
});

export const OrganizationStore = applyPolicies(store, [
  fetchPolicy,
  realtimePolicy,
]);
