import * as Types from '../../../../../routes/src/types/__generated__/graphqlLeads.types';

export type GetWebtrackerQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;

export type GetWebtrackerQuery = {
  __typename?: 'Query';
  webtracker?: {
    __typename?: 'Webtracker';
    id: string;
    domain: string;
    cnameHost: string;
    cnameTarget: string;
    isCnameConfigured: boolean;
    isProxyActive: boolean;
    isArchived: boolean;
    lastEventAt?: any | null;
    createdAt: any;
    updatedAt?: any | null;
  } | null;
};
