import { merge } from 'lodash';
import { Entity } from '@store/record';
import { action, computed, observable } from 'mobx';
import { GetUsersQuery } from '@infra/repositories/core/user/queries/getUsers.generated';

import { UserUpdateInput } from '@shared/types/__generated__/graphql.types';

import { UsersStore } from './Users.store';

export type UserDatum = NonNullable<GetUsersQuery['users']['content'][number]>;

export class User extends Entity<UserDatum> {
  @observable accessor value: UserDatum = User.default();
  constructor(store: UsersStore, data: UserDatum) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(store as any, data);
  }

  get id() {
    return this.value.id;
  }

  @computed
  get name() {
    return (
      this.value.name || `${this.value.firstName} ${this.value.lastName}`.trim()
    );
  }

  @computed
  get profilePhotoUrl() {
    return this.value.profilePhotoUrl;
  }

  @action
  updateName(name: string) {
    this.draft();
    this.value.name = name;
    this.commit({ syncOnly: true });
  }

  @action
  updateProfilePhotoUrl(url: string) {
    this.draft();
    this.value.profilePhotoUrlV2 = url;
    this.commit({ syncOnly: true });
  }

  static default(payload?: UserDatum | UserUpdateInput): UserDatum {
    return merge(
      {
        id: crypto.randomUUID(),
        name: '',
        profilePhotoUrl: '',
        firstName: '',
        lastName: '',
        mailboxes: [],
        bot: false,
        internal: false,
        test: false,
        hasLinkedInToken: false,
        emails: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      payload,
    );
  }
}
