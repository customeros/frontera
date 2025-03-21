export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Time: { input: any; output: any };
};

export type Attachment = {
  __typename?: 'Attachment';
  contentType: Scalars['String']['output'];
  filename: Scalars['String']['output'];
  id: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Connection = {
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EmailBody = {
  html?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export enum EmailDirection {
  Inbound = 'inbound',
  Outbound = 'outbound',
}

export type EmailInput = {
  attachmentIds?: InputMaybe<Array<Scalars['String']['input']>>;
  bccAddresses?: InputMaybe<Array<Scalars['String']['input']>>;
  body: EmailBody;
  ccAddresses?: InputMaybe<Array<Scalars['String']['input']>>;
  fromAddress: Scalars['String']['input'];
  fromName?: InputMaybe<Scalars['String']['input']>;
  mailboxId?: InputMaybe<Scalars['String']['input']>;
  replyTo?: InputMaybe<Scalars['String']['input']>;
  scheduleFor?: InputMaybe<Scalars['Time']['input']>;
  subject: Scalars['String']['input'];
  toAddresses: Array<Scalars['String']['input']>;
  trackClicks?: InputMaybe<Scalars['Boolean']['input']>;
};

export type EmailMessage = {
  __typename?: 'EmailMessage';
  attachmentCount: Scalars['Int']['output'];
  bcc?: Maybe<Array<Scalars['String']['output']>>;
  body: Scalars['String']['output'];
  cc?: Maybe<Array<Scalars['String']['output']>>;
  direction: EmailDirection;
  from: Scalars['String']['output'];
  fromName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  mailboxId: Scalars['String']['output'];
  receivedAt: Scalars['Time']['output'];
  subject: Scalars['String']['output'];
  threadId: Scalars['String']['output'];
  to: Array<Scalars['String']['output']>;
};

export type EmailResult = {
  __typename?: 'EmailResult';
  emailId: Scalars['String']['output'];
  error?: Maybe<Scalars['String']['output']>;
  status: EmailStatus;
};

export enum EmailSecurity {
  None = 'none',
  Ssl = 'ssl',
  Tls = 'tls',
}

export enum EmailStatus {
  Bounced = 'bounced',
  Failed = 'failed',
  Queued = 'queued',
  Received = 'received',
  Scheduled = 'scheduled',
  Sent = 'sent',
}

export type EmailThread = {
  __typename?: 'EmailThread';
  id: Scalars['String']['output'];
  isDone: Scalars['Boolean']['output'];
  isViewed: Scalars['Boolean']['output'];
  lastMessageAt?: Maybe<Scalars['Time']['output']>;
  lastSender: Scalars['String']['output'];
  lastSenderDomain: Scalars['String']['output'];
  mailboxId: Scalars['String']['output'];
  subject: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type EmailThreadConnection = Connection & {
  __typename?: 'EmailThreadConnection';
  edges: Array<EmailThread>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ImapConfig = {
  __typename?: 'ImapConfig';
  imapPassword?: Maybe<Scalars['String']['output']>;
  imapPort?: Maybe<Scalars['Int']['output']>;
  imapSecurity?: Maybe<EmailSecurity>;
  imapServer?: Maybe<Scalars['String']['output']>;
  imapUsername?: Maybe<Scalars['String']['output']>;
};

export type ImapConfigInput = {
  imapPassword?: InputMaybe<Scalars['String']['input']>;
  imapPort?: InputMaybe<Scalars['Int']['input']>;
  imapSecurity?: InputMaybe<EmailSecurity>;
  imapServer?: InputMaybe<Scalars['String']['input']>;
  imapUsername?: InputMaybe<Scalars['String']['input']>;
};

export type Mailbox = {
  __typename?: 'Mailbox';
  connectionErrorMessage?: Maybe<Scalars['String']['output']>;
  connectionStatus: MailboxConnectionStatus;
  emailAddress: Scalars['String']['output'];
  id: Scalars['String']['output'];
  inboundEnabled: Scalars['Boolean']['output'];
  lastConnectionCheck: Scalars['Time']['output'];
  outboundEnabled: Scalars['Boolean']['output'];
  provider: MailboxProvider;
  replyToAddress?: Maybe<Scalars['String']['output']>;
  senderId?: Maybe<Scalars['String']['output']>;
};

export enum MailboxConnectionStatus {
  Active = 'active',
  NotActive = 'not_active',
}

export type MailboxInput = {
  emailAddress: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  imapConfig?: InputMaybe<ImapConfigInput>;
  inboundEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  outboundEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  provider: MailboxProvider;
  replyToAddress?: InputMaybe<Scalars['String']['input']>;
  senderId?: InputMaybe<Scalars['String']['input']>;
  smtpConfig?: InputMaybe<SmtpConfigInput>;
  syncFolders?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum MailboxProvider {
  Generic = 'generic',
  GoogleWorkspace = 'google_workspace',
  Mailstack = 'mailstack',
  Outlook = 'outlook',
}

export type Mutation = {
  __typename?: 'Mutation';
  addMailbox: Mailbox;
  sendEmail: EmailResult;
  updateMailbox: Mailbox;
};

export type MutationAddMailboxArgs = {
  input: MailboxInput;
};

export type MutationSendEmailArgs = {
  input: EmailInput;
};

export type MutationUpdateMailboxArgs = {
  id: Scalars['String']['input'];
  input: MailboxInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  getAllEmailsInThread: Array<EmailMessage>;
  getAllThreads: EmailThreadConnection;
  getThreadMetadata: ThreadMetadata;
};

export type QueryGetAllEmailsInThreadArgs = {
  threadId: Scalars['String']['input'];
};

export type QueryGetAllThreadsArgs = {
  pagination?: InputMaybe<PaginationInput>;
  userId: Scalars['String']['input'];
};

export type QueryGetThreadMetadataArgs = {
  threadId: Scalars['String']['input'];
};

export type SmtpConfig = {
  __typename?: 'SmtpConfig';
  smtpPassword?: Maybe<Scalars['String']['output']>;
  smtpPort?: Maybe<Scalars['Int']['output']>;
  smtpSecurity?: Maybe<EmailSecurity>;
  smtpServer?: Maybe<Scalars['String']['output']>;
  smtpUsername?: Maybe<Scalars['String']['output']>;
};

export type SmtpConfigInput = {
  smtpPassword?: InputMaybe<Scalars['String']['input']>;
  smtpPort?: InputMaybe<Scalars['Int']['input']>;
  smtpSecurity?: InputMaybe<EmailSecurity>;
  smtpServer?: InputMaybe<Scalars['String']['input']>;
  smtpUsername?: InputMaybe<Scalars['String']['input']>;
};

export type ThreadMetadata = {
  __typename?: 'ThreadMetadata';
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  hasAttachments: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  participants: Array<Scalars['String']['output']>;
  summary: Scalars['String']['output'];
};
