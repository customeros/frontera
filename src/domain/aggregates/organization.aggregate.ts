import type { RootStore } from '@/store/root';
import type { User } from '@/store/Users/User.dto';
import type { Organization } from '@/domain/entities';
import type { Contact, ContactDatum } from '@/store/Contacts/Contact.dto';

import { makeAutoObservable } from 'mobx';
import { registry } from '@/domain/stores/registry';

import type { Contract } from '@shared/types/__generated__/graphql.types';

export class OrganizationAggregate {
  private organizationStore = registry.get('organizations');

  constructor(
    private organization: Organization,
    private rootStore: RootStore,
  ) {
    makeAutoObservable(this);
  }

  get primaryDomains() {
    if (!this.organization.domainsDetails) return [];

    return this.organization.domainsDetails
      .filter((e) => e.primary)
      .map((e) => e.domain);
  }

  get owner(): User | null {
    if (!this.organization.owner) return null;
    const user = this.rootStore.users.value.get(
      this.organization?.owner.id as string,
    );

    return user ?? null;
  }

  get contacts() {
    this.rootStore.contacts.retrieve(this.organization.contacts);

    return this.organization.contacts.reduce((acc, id) => {
      const record = this.rootStore.contacts.getById(id);

      if (record) acc.push(record.value);

      return acc;
    }, [] as ContactDatum[]);
  }

  get contracts() {
    return this.organization.contracts.reduce((acc, id) => {
      const store = this.rootStore.contracts.value.get(id);

      if (store) acc.push(store.value);

      return acc;
    }, [] as Contract[]);
  }

  get invoices() {
    return this.rootStore.invoices
      .toArray()
      .filter(
        (invoice) =>
          invoice?.value?.organization?.metadata?.id === this.organization.id &&
          !invoice?.value?.dryRun,
      );
  }

  get parentCompanies() {
    return this.organization.parentId
      ? [this.organizationStore.getOrFetch(this.organization.parentId)]
      : [null];
  }

  get subsidiaries() {
    return this.organization.subsidiaries.reduce((acc, id) => {
      const record = this.organizationStore.get(id);

      if (record) acc.push(record);

      return acc;
    }, [] as Organization[]);
  }

  setOwner = (userId: string) => {
    const record = this.rootStore.users.value.get(userId);

    if (!record) return;

    this.organization.owner = record.value;
  };

  clearOwner = () => {
    this.organization.owner = null;
  };

  addTag = (id: string) => {
    if (!this.organization.tags) {
      this.organization.tags = [];
    }

    const tag = this.rootStore.tags.getById(id);

    if (!tag) {
      console.error(
        `OrganizationAggregate.addTag: Tag with id ${id} not found`,
      );

      return;
    }

    this.organization.tags.push(tag.value);
  };

  deleteTag = (id: string) => {
    const index = this.organization.tags.findIndex((t) => t.metadata.id === id);

    this.organization.tags.splice(index, 1);
  };

  clearTags = () => {
    this.organization.tags = [];
  };

  mergeOrganizations = (organizations: Organization[]) => {
    organizations.forEach((o) => this.organizationStore.delete(o.id));
  };

  addContact = (contact: Contact) => {
    this.organization.contacts.push(contact?.id);
  };
}
