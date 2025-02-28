import { Transport } from '@infra/transport';

import BuyDomainsDocument from './buyDomains.graphql';
import GetDomainsDocument from './getDomains.graphql';
import { GetDomainsQuery } from './getDomains.generated';
import GetMailboxesDocument from './getMailboxes.graphql';
import { MailboxesQuery } from './getMailboxes.generated';
import ValidateDomainsDocument from './validateDomains.graphql';
import GetPaymentIntentDocument from './getPaymentIntent.graphql';
import GetDomainSuggestionsDocument from './getDomainSuggestions.graphql';
import {
  BuyDomainsMutation,
  BuyDomainsMutationVariables,
} from './buyDomains.generated';
import {
  ValidateDomainsQuery,
  ValidateDomainsQueryVariables,
} from './validateDomains.generated';
import {
  GetPaymentIntentMutation,
  GetPaymentIntentMutationVariables,
} from './getPaymentIntent.generated';
import {
  GetDomainSuggestionsQuery,
  GetDomainSuggestionsQueryVariables,
} from './getDomainSuggestions.generated';

export class MailboxesService {
  private static instance: MailboxesService;
  private transport: Transport;

  private constructor(transport: Transport) {
    this.transport = transport;
  }

  static getInstance(transport: Transport) {
    if (!MailboxesService.instance) {
      MailboxesService.instance = new MailboxesService(transport);
    }

    return MailboxesService.instance;
  }

  async getDomainSuggestions(payload: GetDomainSuggestionsQueryVariables) {
    return this.transport.graphql.request<
      GetDomainSuggestionsQuery,
      GetDomainSuggestionsQueryVariables
    >(GetDomainSuggestionsDocument, payload);
  }

  async getMailstackDomains() {
    return this.transport.graphql.request<GetDomainsQuery>(GetDomainsDocument);
  }

  async validateDomains(payload: ValidateDomainsQueryVariables) {
    return this.transport.graphql.request<
      ValidateDomainsQuery,
      ValidateDomainsQueryVariables
    >(ValidateDomainsDocument, payload);
  }

  async getMailboxes() {
    return this.transport.graphql.request<MailboxesQuery>(GetMailboxesDocument);
  }

  async buyDomains(payload: BuyDomainsMutationVariables) {
    return this.transport.graphql.request<
      BuyDomainsMutation,
      BuyDomainsMutationVariables
    >(BuyDomainsDocument, payload);
  }

  async getPaymentIntent(payload: GetPaymentIntentMutationVariables) {
    return this.transport.graphql.request<
      GetPaymentIntentMutation,
      GetPaymentIntentMutationVariables
    >(GetPaymentIntentDocument, payload);
  }
}
