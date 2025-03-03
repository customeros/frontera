import * as Types from '../../../../routes/src/types/__generated__/graphql.types';

export type GetCurrentUserQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetCurrentUserQuery = {
  __typename?: 'Query';
  user_Current: {
    __typename?: 'User';
    id: string;
    name?: string | null;
    profilePhotoUrl?: string | null;
  };
};
