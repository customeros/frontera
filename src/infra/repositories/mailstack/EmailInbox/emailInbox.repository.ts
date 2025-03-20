import { Transport } from '@infra/transport';

import GetInboxDocument from './query/getInbox.graphql';
import {
  GetInboxQueryQuery,
  GetInboxQueryQueryVariables,
} from './query/getInbox.generated';

export class EmailInboxRepository {
  static instance: EmailInboxRepository | null = null;
  private transport = Transport.getInstance('mailstack');

  public static getInstance() {
    if (!EmailInboxRepository.instance) {
      EmailInboxRepository.instance = new EmailInboxRepository();
    }

    return EmailInboxRepository.instance;
  }

  async getInboxes(
    payload: GetInboxQueryQueryVariables,
  ): Promise<GetInboxQueryQuery> {
    return this.transport.graphql.request<
      GetInboxQueryQuery,
      GetInboxQueryQueryVariables
    >(GetInboxDocument, payload);
  }
}
