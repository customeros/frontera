import * as Types from '../../../../../routes/src/types/__generated__/graphqlRealtime.types';

export type UpdateDocumentMutationVariables = Types.Exact<{
  input: Types.UpdateDocumentInput;
}>;

export type UpdateDocumentMutation = {
  __typename?: 'RootMutationType';
  updateDocument?: {
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
