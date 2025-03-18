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
  Time: { input: any; output: any };
  ID: { input: string; output: string };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
};

export type Attachment = {
  __typename?: 'Attachment';
  id: Scalars['String']['output'];
  url: Scalars['String']['output'];
  filename: Scalars['String']['output'];
  messageId: Scalars['String']['output'];
  contentType: Scalars['String']['output'];
};

export enum EmailDirection {
  Inbound = 'inbound',
  Outbound = 'outbound',
}

export type EmailMessage = {
  direction: EmailDirection;
  __typename?: 'EmailMessage';
  id: Scalars['String']['output'];
  body: Scalars['String']['output'];
  from: Scalars['String']['output'];
  subject: Scalars['String']['output'];
  receivedAt: Scalars['Time']['output'];
  threadId: Scalars['String']['output'];
  mailboxId: Scalars['String']['output'];
  to: Array<Scalars['String']['output']>;
  attachmentCount: Scalars['Int']['output'];
  cc?: Maybe<Array<Scalars['String']['output']>>;
  bcc?: Maybe<Array<Scalars['String']['output']>>;
};

export type EmailThread = {
  __typename?: 'EmailThread';
  id: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  isDone: Scalars['Boolean']['output'];
  subject: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  isViewed: Scalars['Boolean']['output'];
  mailboxId: Scalars['String']['output'];
  lastSender: Scalars['String']['output'];
  lastSenderDomain: Scalars['String']['output'];
  lastMessageAt?: Maybe<Scalars['Time']['output']>;
};

export type Query = {
  __typename?: 'Query';
  getThreadMetadata: ThreadMetadata;
  getThreadsByUser: Array<EmailThread>;
  getEmailsByThread: Array<EmailMessage>;
};

export type QueryGetEmailsByThreadArgs = {
  threadId: Scalars['String']['input'];
};

export type QueryGetThreadMetadataArgs = {
  threadId: Scalars['String']['input'];
};

export type QueryGetThreadsByUserArgs = {
  userId: Scalars['String']['input'];
};

export type ThreadMetadata = {
  __typename?: 'ThreadMetadata';
  id: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  hasAttachments: Scalars['Boolean']['output'];
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  participants: Array<Scalars['String']['output']>;
};
