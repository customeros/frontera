import { Transport } from '@infra/transport';

import GetUsersDocument from './queries/getUsers.graphql';
import UpdateUserDocument from './mutations/user_update.graphql';
import GetCurrentUserDocument from './queries/getCurrentUser.graphql';
import {
  GetUsersQuery,
  GetUsersQueryVariables,
} from './queries/getUsers.generated';
import {
  UserUpdateMutation,
  UserUpdateMutationVariables,
} from './mutations/user_update.generated';
import {
  GetCurrentUserQuery,
  GetCurrentUserQueryVariables,
} from './queries/getCurrentUser.generated';

export class UserRepository {
  static instance: UserRepository | null = null;
  private transport = Transport.getInstance();

  public static getInstance() {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }

    return UserRepository.instance;
  }

  async getUsers(payload: GetUsersQueryVariables): Promise<GetUsersQuery> {
    return this.transport.graphql.request<
      GetUsersQuery,
      GetUsersQueryVariables
    >(GetUsersDocument, payload);
  }

  async updateUser(
    payload: UserUpdateMutationVariables,
  ): Promise<UserUpdateMutation> {
    return this.transport.graphql.request<
      UserUpdateMutation,
      UserUpdateMutationVariables
    >(UpdateUserDocument, payload);
  }

  async getCurrentUser(): Promise<GetCurrentUserQuery> {
    return this.transport.graphql.request<
      GetCurrentUserQuery,
      GetCurrentUserQueryVariables
    >(GetCurrentUserDocument);
  }
}
