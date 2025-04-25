import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type DisconnectCalendarMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
}>;

export type DisconnectCalendarMutation = {
  __typename?: 'Mutation';
  nylasDisconnect: boolean;
};
