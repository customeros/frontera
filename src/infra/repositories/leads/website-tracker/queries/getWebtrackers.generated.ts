import * as Types from '../../../../../routes/src/types/__generated__/graphqlLeads.types';

export type GetWebtrackersQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetWebtrackersQuery = {
  __typename?: 'Query';
  webtrackers: Array<{
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
  }>;
};
