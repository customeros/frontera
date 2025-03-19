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
  messageId: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export enum EmailDirection {
  Inbound = 'inbound',
  Outbound = 'outbound',
}

export type EmailMessage = {
  __typename?: 'EmailMessage';
  attachmentCount: Scalars['Int']['output'];
  bcc?: Maybe<Array<Scalars['String']['output']>>;
  body: Scalars['String']['output'];
  cc?: Maybe<Array<Scalars['String']['output']>>;
  direction: EmailDirection;
  from: Scalars['String']['output'];
  id: Scalars['String']['output'];
  mailboxId: Scalars['String']['output'];
  receivedAt: Scalars['Time']['output'];
  subject: Scalars['String']['output'];
  threadId: Scalars['String']['output'];
  to: Array<Scalars['String']['output']>;
};

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

export type Query = {
  __typename?: 'Query';
  getEmailsByThread: Array<EmailMessage>;
  getThreadMetadata: ThreadMetadata;
  getThreadsByUser: Array<EmailThread>;
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
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  hasAttachments: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  participants: Array<Scalars['String']['output']>;
  summary: Scalars['String']['output'];
};
