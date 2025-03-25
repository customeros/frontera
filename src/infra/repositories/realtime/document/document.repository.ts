import { Transport } from '@infra/transport';

import DeleteDocumentDocument from './mutations/deleteDocument.graphql';
import UpdateDocumentDocument from './mutations/updateDocument.graphql';
import OrganizationDocumentsDocument from './queries/organizationDocuments.graphql';
import CreateOrganizationDocumentDocument from './mutations/createOrganizationDocument.graphql';
import {
  DeleteDocumentMutation,
  DeleteDocumentMutationVariables,
} from './mutations/deleteDocument.generated';
import {
  UpdateDocumentMutation,
  UpdateDocumentMutationVariables,
} from './mutations/updateDocument.generated';
import {
  OrganizationDocumentsQuery,
  OrganizationDocumentsQueryVariables,
} from './queries/organizationDocuments.generated';
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

  async updateDocument(variables: UpdateDocumentMutationVariables) {
    return this.transport.graphql.request<
      UpdateDocumentMutation,
      UpdateDocumentMutationVariables
    >(UpdateDocumentDocument, variables);
  }

  async deleteDocument(variables: DeleteDocumentMutationVariables) {
    return this.transport.graphql.request<
      DeleteDocumentMutation,
      DeleteDocumentMutationVariables
    >(DeleteDocumentDocument, variables);
  }
}
