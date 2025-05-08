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

export type Connection = {
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createWebtracker: Webtracker;
  updateWebtracker: Webtracker;
  archiveWebtracker: Scalars['Boolean']['output'];
  verifyWebtrackerCname: Scalars['Boolean']['output'];
};

export type MutationArchiveWebtrackerArgs = {
  id: Scalars['String']['input'];
};

export type MutationCreateWebtrackerArgs = {
  tracker: WebtrackerSaveInput;
};

export type MutationUpdateWebtrackerArgs = {
  tracker: WebtrackerSaveInput;
};

export type MutationVerifyWebtrackerCnameArgs = {
  id: Scalars['String']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  endCursor?: Maybe<Scalars['String']['output']>;
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  webtracker?: Maybe<Webtracker>;
  webtrackers: Array<Webtracker>;
};

export type QueryWebtrackerArgs = {
  id: Scalars['String']['input'];
};

export type Webtracker = {
  __typename?: 'Webtracker';
  id: Scalars['String']['output'];
  domain: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  cnameHost: Scalars['String']['output'];
  cnameTarget: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  isProxyActive: Scalars['Boolean']['output'];
  updatedAt?: Maybe<Scalars['Time']['output']>;
  lastEventAt?: Maybe<Scalars['Time']['output']>;
  isCnameConfigured: Scalars['Boolean']['output'];
};

export type WebtrackerSaveInput = {
  domain: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  cnameHost?: InputMaybe<Scalars['String']['input']>;
};
