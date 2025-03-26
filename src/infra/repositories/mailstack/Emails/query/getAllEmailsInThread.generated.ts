import * as Types from '../../../../../routes/src/types/__generated__/graphqlMailstack.types';

export type GetAllEmailsInThreadQueryVariables = Types.Exact<{
  threadId: Types.Scalars['String']['input'];
}>;

export type GetAllEmailsInThreadQuery = {
  __typename?: 'Query';
  getAllEmailsInThread: Array<{
    __typename?: 'EmailMessage';
    attachmentCount: number;
    bcc?: Array<string> | null;
    body: string;
    cc?: Array<string> | null;
    direction: Types.EmailDirection;
    from: string;
    fromName: string;
    id: string;
    mailboxId: string;
    receivedAt: any;
    subject: string;
    threadId: string;
    to: Array<string>;
  }>;
};
