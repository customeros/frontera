import * as Types from '../../../../../routes/src/types/__generated__/graphqlRealtime.types';

export type DeleteDocumentMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;

export type DeleteDocumentMutation = {
  __typename?: 'RootMutationType';
  deleteDocument?: {
    __typename?: 'Document';
    id: string;
    name: string;
    tenant?: string | null;
    userId: string;
    icon?: string | null;
    color?: string | null;
    organizationId?: string | null;
    insertedAt: string;
    updatedAt: string;
  } | null;
};
