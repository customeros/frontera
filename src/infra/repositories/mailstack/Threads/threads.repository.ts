import { Transport } from '@infra/transport';

import GetInboxDocument from './query/getInbox.graphql';
import {
  GetInboxQueryQuery,
  GetInboxQueryQueryVariables,
} from './query/getInbox.generated';

export class ThreadsRepository {
  static instance: ThreadsRepository | null = null;
  private transport = Transport.getInstance('mailstack');

  public static getInstance() {
    if (!ThreadsRepository.instance) {
      ThreadsRepository.instance = new ThreadsRepository();
    }

    return ThreadsRepository.instance;
  }

  async getThreads(
    payload: GetInboxQueryQueryVariables,
  ): Promise<GetInboxQueryQuery> {
    return this.transport.graphql.request<
      GetInboxQueryQuery,
      GetInboxQueryQueryVariables
    >(GetInboxDocument, payload);
  }
}
