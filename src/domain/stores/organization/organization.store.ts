import { runInAction } from 'mobx';
import { Store } from '@/lib/store/store';
import { Transport } from '@/infra/transport';
import { PhoenixMap } from '@/lib/map/phoenix-map';
import { OrganizationRepository } from '@/infra/repositories/core/organization';
import {
  Aggregate,
  FetchPolicy,
  applyPolicies,
  AggregatePolicy,
} from '@/lib/policy';

import { Organization } from './organization';

const transport = Transport.getInstance('core');
const repository = new OrganizationRepository();
const channel = transport.socket?.channel('OrganizationStore:PureThePhantom', {
  ...transport.channelMeta,
  user_id: 1,
  username: 'Alex',
});

const cache = () => {
  if (channel?.state !== 'joined') {
    channel?.join();
  }

  return new PhoenixMap<string, Organization>(channel!, {
    versionBy: 'updatedAt',
    fetchOnInvalidate: async (id) => {
      const res = await repository.getOrganizationsByIds({
        ids: [id],
      });

      return new Organization(res.ui_organizations?.[0]);
    },
  });
};
const store = new Store<Organization>({
  cache,
  mutator: runInAction,
});

const fetchPolicy = new FetchPolicy(async ({ key }) => {
  const res = await repository.getOrganizationsByIds({ ids: [key as string] });

  return new Organization(res.ui_organizations?.[0]);
});

class OrganizationAggregate extends Aggregate<Organization> {}

const aggregatePolicy = new AggregatePolicy(OrganizationAggregate, {
  contacts: (contacts) => contacts.map((v) => v),
});

export const OrganizationStore = applyPolicies(store, [
  fetchPolicy,
  aggregatePolicy,
]);
