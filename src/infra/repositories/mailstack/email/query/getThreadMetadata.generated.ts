import * as Types from '../../../../../routes/src/types/__generated__/graphqlMailstack.types';

export type GetThreadQueryQueryVariables = Types.Exact<{
  threadId: Types.Scalars['String']['input'];
}>;

export type GetThreadQueryQuery = {
  __typename?: 'Query';
  getThreadMetadata: {
    __typename?: 'ThreadMetadata';
    id: string;
    summary: string;
    participants: Array<string>;
    hasAttachments: boolean;
  };
};
