import { Transport } from '@infra/transport';

import OrganizationDocumentsDocument from './queries/organizationDocuments.graphql';
import CreateOrganizationDocumentDocument from './mutations/createOrganizationDocument.graphql';
import {
  OrganizationDocumentsQuery,
  OrganizationDocumentsQueryVariables,
} from './queries/oranizationDocuments.generated';
import {
  CreateOrganizationDocumentMutation,
  CreateOrganizationDocumentMutationVariables,
} from './mutations/createOrganizationDocument.generated';

export class DocumentRepository {
  private transport = Transport.getInstance('realtime');

  private static instance: DocumentRepository;

  constructor() {}

  static getInstance(): DocumentRepository {
    if (!DocumentRepository.instance) {
      DocumentRepository.instance = new DocumentRepository();
    }

    return DocumentRepository.instance;
  }

  async getOrganizationDocuments(
    variables: OrganizationDocumentsQueryVariables,
  ) {
    return this.transport.graphql.request<
      OrganizationDocumentsQuery,
      OrganizationDocumentsQueryVariables
    >(OrganizationDocumentsDocument, variables);
  }

  async createOrganizationDocument(
    variables: CreateOrganizationDocumentMutationVariables,
  ) {
    return this.transport.graphql.request<
      CreateOrganizationDocumentMutation,
      CreateOrganizationDocumentMutationVariables
    >(CreateOrganizationDocumentDocument, variables);
  }
}
