import { Transport } from '@infra/transport';

import SendEmailDocument from './mutations/sedEmail.graphql';
import { SendEmailMutation } from './mutations/sedEmail.generated';
import { SendEmailMutationVariables } from './mutations/sedEmail.generated';
import GetAllEmailsInThreadDocument from './query/getAllEmailsInThread.graphql';
import {
  GetAllEmailsInThreadQuery,
  GetAllEmailsInThreadQueryVariables,
} from './query/getAllEmailsInThread.generated';

export class EmailsRepository {
  static instance: EmailsRepository | null = null;
  private transport = Transport.getInstance('mailstack');

  public static getInstance() {
    if (!EmailsRepository.instance) {
      EmailsRepository.instance = new EmailsRepository();
    }

    return EmailsRepository.instance;
  }

  async getAllEmailsInThread(payload: GetAllEmailsInThreadQueryVariables) {
    return this.transport.graphql.request<
      GetAllEmailsInThreadQuery,
      GetAllEmailsInThreadQueryVariables
    >(GetAllEmailsInThreadDocument, payload);
  }

  async sendEmail(payload: SendEmailMutationVariables) {
    return this.transport.graphql.request<
      SendEmailMutation,
      SendEmailMutationVariables
    >(SendEmailDocument, payload);
  }
}
