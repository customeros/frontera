import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type CalendarConnectionQueryVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
}>;

export type CalendarConnectionQuery = {
  __typename?: 'Query';
  nylasIsConnected: {
    __typename?: 'NylasDetails';
    connected: boolean;
    refreshNeeded: boolean;
    email?: string | null;
  };
};
