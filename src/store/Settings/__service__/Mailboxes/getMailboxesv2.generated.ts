import * as Types from '../../../../routes/src/types/__generated__/graphql.types';

export type MailboxesQueryVariables = Types.Exact<{ [key: string]: never }>;

export type MailboxesQuery = {
  __typename?: 'Query';
  mailstack_MailboxesV2: Array<{
    __typename?: 'MailboxV2';
    provider: Types.MailboxProvider;
    mailbox: string;
    usedInFlows: boolean;
    rampUpRate: number;
    rampUpMax: number;
    rampUpCurrent: number;
    needsManualRefresh: boolean;
  }>;
};
