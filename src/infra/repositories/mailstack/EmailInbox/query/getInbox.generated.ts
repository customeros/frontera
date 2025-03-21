import * as Types from '../../../../../routes/src/types/__generated__/graphqlMailstack.types';

export type GetInboxQueryQueryVariables = Types.Exact<{
  userId: Types.Scalars['String']['input'];
  pagination?: Types.InputMaybe<Types.PaginationInput>;
}>;

export type GetInboxQueryQuery = {
  __typename?: 'Query';
  getAllThreads: {
    __typename?: 'EmailThreadConnection';
    totalCount: number;
    edges: Array<{
      __typename?: 'EmailThread';
      id: string;
      isDone: boolean;
      isViewed: boolean;
      lastMessageAt?: any | null;
      lastSender: string;
      lastSenderDomain: string;
      mailboxId: string;
      subject: string;
      summary: string;
      userId: string;
    }>;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  };
};
