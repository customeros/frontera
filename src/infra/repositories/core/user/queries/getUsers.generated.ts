import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type GetUsersQueryVariables = Types.Exact<{
  pagination: Types.Pagination;
  where?: Types.InputMaybe<Types.Filter>;
}>;


export type GetUsersQuery = { __typename?: 'Query', users: { __typename?: 'UserPage', totalElements: any, content: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, name?: string | null, profilePhotoUrl?: string | null, mailboxes: Array<string>, bot: boolean, internal: boolean, test: boolean, timezone?: string | null, hasLinkedInToken: boolean, emails?: Array<{ __typename?: 'Email', email?: string | null }> | null }> } };
