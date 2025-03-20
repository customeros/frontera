import * as Types from '../../../../../routes/src/types/__generated__/graphqlRealtime.types';

export type OrganizationDocumentsQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['ID']['input'];
}>;

export type OrganizationDocumentsQuery = {
  __typename?: 'RootQueryType';
  organizationDocuments?: Array<{
    __typename?: 'Document';
    id: string;
    name: string;
    tenant?: string | null;
    userId: string;
    insertedAt: string;
    updatedAt: string;
  } | null> | null;
};
