import * as Types from '../../../../../routes/src/types/__generated__/graphqlRealtime.types';

export type CreateOrganizationDocumentMutationVariables = Types.Exact<{
  input: Types.CreateDocumentInput;
}>;

export type CreateOrganizationDocumentMutation = {
  __typename?: 'RootMutationType';
  createDocument?: {
    __typename?: 'Document';
    id: string;
    name: string;
    tenant?: string | null;
    userId: string;
    icon?: string | null;
    insertedAt: string;
    updatedAt: string;
  } | null;
};
