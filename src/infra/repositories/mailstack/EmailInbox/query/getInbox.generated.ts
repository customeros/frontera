import * as Types from '../../../../../routes/src/types/__generated__/graphqlMailstack.types';

export type GetInboxQueryQueryVariables = Types.Exact<{
  userId: Types.Scalars['String']['input'];
}>;

export type GetInboxQueryQuery = {
  __typename?: 'Query';
  getThreadsByUser: Array<{
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
};
