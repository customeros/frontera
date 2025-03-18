import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type UserUpdateMutationVariables = Types.Exact<{
  input: Types.UserUpdateInput;
}>;

export type UserUpdateMutation = {
  __typename?: 'Mutation';
  user_Update: { __typename?: 'User'; id: string };
};
