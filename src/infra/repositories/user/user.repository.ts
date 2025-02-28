import { Transport } from '@infra/transport';

import GetUsersDocument from './quaries/getUsers.graphql';
import UpdateUserDocument from './mutations/user_update.graphql';
import {
  GetUsersQuery,
  GetUsersQueryVariables,
} from './quaries/getUsers.generated';
import {
  UserUpdateMutation,
  UserUpdateMutationVariables,
} from './mutations/user_update.generated';

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
}
