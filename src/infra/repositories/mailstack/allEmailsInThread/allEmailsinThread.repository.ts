import { Transport } from '@infra/transport';

import GetAllEmailsInThreadDocument from './query/getAllEmailsInThread.graphql';
import {
  GetAllEmailsInThreadQuery,
  GetAllEmailsInThreadQueryVariables,
} from './query/getAllEmailsInThread.generated';

export class AllEmailsInThreadRepository {
  static instance: AllEmailsInThreadRepository | null = null;
  private transport = Transport.getInstance('mailstack');

  public static getInstance() {
    if (!AllEmailsInThreadRepository.instance) {
      AllEmailsInThreadRepository.instance = new AllEmailsInThreadRepository();
    }

    return AllEmailsInThreadRepository.instance;
  }

  async getAllEmailsInThread(payload: GetAllEmailsInThreadQueryVariables) {
    return this.transport.graphql.request<
      GetAllEmailsInThreadQuery,
      GetAllEmailsInThreadQueryVariables
    >(GetAllEmailsInThreadDocument, payload);
  }
}
