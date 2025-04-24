import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type ConnectCalendarMutationVariables = Types.Exact<{
  input: Types.NylasConnectInput;
}>;

export type ConnectCalendarMutation = {
  __typename?: 'Mutation';
  nylasConnect: {
    __typename?: 'NylasDetails';
    connected: boolean;
    refreshNeeded: boolean;
    email?: string | null;
  };
};
