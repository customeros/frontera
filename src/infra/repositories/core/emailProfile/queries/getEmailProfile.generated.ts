import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type GetEmailProfileQueryVariables = Types.Exact<{
  emails:
    | Array<Types.Scalars['String']['input']>
    | Types.Scalars['String']['input'];
}>;

export type GetEmailProfileQuery = {
  __typename?: 'Query';
  email_ProfilePhoto: Array<{
    __typename?: 'EmailProfile';
    email: string;
    profilePhotoUrl: string;
    profilePhotoUrlId: string;
    name: string;
  }>;
};
