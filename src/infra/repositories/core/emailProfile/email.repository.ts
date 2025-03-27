import { Transport } from '@infra/transport';

import GetEmailProfileDocument from './queries/getEmailProfile.graphql';
import {
  GetEmailProfileQuery,
  GetEmailProfileQueryVariables,
} from './queries/getEmailProfile.generated';
export class EmailProfileRepository {
  static instance: EmailProfileRepository | null = null;
  private transport = Transport.getInstance('core');

  public static getInstance() {
    if (!EmailProfileRepository.instance) {
      EmailProfileRepository.instance = new EmailProfileRepository();
    }

    return EmailProfileRepository.instance;
  }

  async getProfile(payload: GetEmailProfileQueryVariables) {
    return this.transport.graphql.request<
      GetEmailProfileQuery,
      GetEmailProfileQueryVariables
    >(GetEmailProfileDocument, payload);
  }
}
