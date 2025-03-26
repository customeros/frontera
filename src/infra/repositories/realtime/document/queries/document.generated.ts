import * as Types from '../../../../../routes/src/types/__generated__/graphqlRealtime.types';

export type DocumentQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;

export type DocumentQuery = {
  __typename?: 'RootQueryType';
  document?: {
    __typename?: 'Document';
    id: string;
    name: string;
    tenant?: string | null;
    userId: string;
    icon?: string | null;
    organizationId?: string | null;
    insertedAt: string;
    updatedAt: string;
  } | null;
};
