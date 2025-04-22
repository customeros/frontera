import { Channel } from 'phoenix';
import { Store } from '@/lib/store/store';
import { Transport } from '@/infra/transport';
import { Organization } from '@/domain/entities';
import { reaction, runInAction, ObservableMap } from 'mobx';
import { sessionStore } from '@/domain/stores/session.store';
import { FetchPolicy, applyPolicies, RealtimePolicy } from '@/lib/policy';
import { OrganizationRepository } from '@/infra/repositories/core/organization';
import { OrganizationViews } from '@/domain/views/organization/organization.views';

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

const fetchPolicy = new FetchPolicy(async ({ key }) => {
  const res = await repository.getOrganizationsByIds({ ids: [key as string] });

  return new Organization(res.ui_organizations?.[0]);
});

const realtimePolicy = new RealtimePolicy<Organization>(getChannel, {
  versionBy: 'updatedAt',
  whenReady: (ready) =>
    reaction(() => sessionStore.isAuthenticated, ready, {
      fireImmediately: true,
    }),
  fetchOnInvalidate: async (id) => {
    const res = await repository.getOrganizationsByIds({
      ids: [id as string],
    });

    return new Organization(res.ui_organizations?.[0]);
  },
  onEvent: (p) => {
    if (p.type === 'store:set') {
      OrganizationViews.revalidate(new Organization(p.value));
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
